
/*
The MIT License (MIT)

Copyright (c) 2015 Solid

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Solid.js is a Javascript library for Solid applications. This library currently
depends on rdflib.js. Please make sure to load the rdflib.js script before
loading solid.js.

If you would like to know more about the solid Solid project, please see
https://github.com/solid/

*/

// Identity / WebID
var Solid = Solid || {};
Solid.fetch = fetch;

Solid.identity = (function(window) {
    'use strict';

    // common vocabs
    var RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    var OWL = $rdf.Namespace("http://www.w3.org/2002/07/owl#");
    var PIM = $rdf.Namespace("http://www.w3.org/ns/pim/space#");
    var FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
    var DCT = $rdf.Namespace("http://purl.org/dc/terms/");

    // fetch user profile (follow sameAs links) and return promise with a graph
    // resolve(graph)
    var getProfile = function(url) {
        var promise = new Promise(function(resolve, reject) {
            // Load main profile
            Solid.web.get(url).then(
                function(graph) {
                    // set WebID
                    var webid = graph.any($rdf.sym(url), FOAF('primaryTopic'));

                    // primaryTopic is optional, so default webid to URL
                    if (webid === undefined) webid = url

                    // find additional resources to load
                    var sameAs = graph.statementsMatching(webid, OWL('sameAs'), undefined);
                    var seeAlso = graph.statementsMatching(webid, OWL('seeAlso'), undefined);
                    var prefs = graph.statementsMatching(webid, PIM('preferencesFile'), undefined);
                    var toLoad = sameAs.length + seeAlso.length + prefs.length;

                    // sync promises externally instead of using Promise.all() which fails if one GET fails
                    var syncAll = function() {
                        if (toLoad === 0) {
                            return resolve(graph);
                        }
                    }
                    if (toLoad === 0) resolve(graph);

                    // Load sameAs files
                    if (sameAs.length > 0) {
                        sameAs.forEach(function(same){
                            Solid.web.get(same.object.value, same.object.value).then(
                                function(g) {
                                    Solid.utils.appendGraph(graph, g);
                                    toLoad--;
                                    syncAll();
                                }
                            ).catch(
                            function(err){
                                toLoad--;
                                syncAll();
                            });
                        });
                    }
                    // Load seeAlso files
                    if (seeAlso.length > 0) {
                        seeAlso.forEach(function(see){
                            Solid.web.get(see.object.value).then(
                                function(g) {
                                    Solid.utils.appendGraph(graph, g, see.object.value);
                                    toLoad--;
                                    syncAll();
                                }
                            ).catch(
                            function(err){
                                toLoad--;
                                syncAll();
                            });
                        });
                    }
                    // Load preferences files
                    if (prefs.length > 0) {
                        prefs.forEach(function(pref){
                            Solid.web.get(pref.object.value).then(
                                function(g) {
                                    Solid.utils.appendGraph(graph, g, pref.object.value);
                                    toLoad--;
                                    syncAll();
                                }
                            ).catch(
                            function(err){
                                toLoad--;
                                syncAll();
                            });
                        });
                    }
                }
            )
            .catch(
                function(err) {
                    reject(err);
                }
            );
        });

        return promise;
    };

    // Find the user's workspaces
    // Return an object with the list of objects (workspaces)
    var getWorkspaces = function(webid, graph) {
        var promise = new Promise(function(resolve, reject){
            if (!graph) {
                // fetch profile and call function again
                getProfile(webid).then(function(g) {
                    getWorkspaces(webid, g).then(function(ws) {
                        return resolve(ws);
                    }).catch(function(err) {
                        return reject(err);
                    });
                }).catch(function(err){
                    return reject(err);
                });
            } else {
                // find workspaces
                var workspaces = [];
                var ws = graph.statementsMatching($rdf.sym(webid), PIM('workspace'), undefined);
                if (ws.length === 0) {
                    return resolve(workspaces);
                }
                ws.forEach(function(w){
                    // try to get some additional info - i.e. desc/title
                    var workspace = {};
                    var title = graph.any(w.object, DCT('title'));
                    if (title && title.value) {
                        workspace.title = title.value;
                    }
                    workspace.url = w.object.uri;
                    workspace.statements = graph.statementsMatching(w.object, undefined, undefined);
                    workspaces.push(workspace);
                });
                return resolve(workspaces);
            }
        });

        return promise;
    };

    // return public methods
    return {
        getProfile: getProfile,
        getWorkspaces: getWorkspaces
    };
}(this));
// Events
Solid = Solid || {};
Solid.status = (function(window) {
    'use strict';

    // Get current online status
    var isOnline = function() {
        return window.navigator.onLine;
    };

    // Is offline
    var onOffline = function(callback) {
        window.addEventListener("offline", callback, false);
    };
    // Is online
    var onOnline = function(callback) {
        window.addEventListener("online", callback, false);
    };

    // return public methods
    return {
        isOnline: isOnline,
        onOffline: onOffline,
        onOnline: onOnline,
    };
}(this));
// Helper functions
var Solid = Solid || {};
Solid.utils = (function(window) {
    'use strict';

    // parse a Link header
    var parseLinkHeader = function(link) {
        if (!link) return undefined

        var linkexp = /<[^>]*>\s*(\s*;\s*[^\(\)<>@,;:"\/\[\]\?={} \t]+=(([^\(\)<>@,;:"\/\[\]\?={} \t]+)|("[^"]*")))*(,|$)/g;
        var paramexp = /[^\(\)<>@,;:"\/\[\]\?={} \t]+=(([^\(\)<>@,;:"\/\[\]\?={} \t]+)|("[^"]*"))/g;

        var matches = link.match(linkexp);
        var rels = {};
        for (var i = 0; i < matches.length; i++) {
            var split = matches[i].split('>');
            var href = split[0].substring(1);
            var ps = split[1];
            var s = ps.match(paramexp);
            for (var j = 0; j < s.length; j++) {
                var p = s[j];
                var paramsplit = p.split('=');
                var name = paramsplit[0];
                var rel = paramsplit[1].replace(/["']/g, '');
                rels[rel] = href;
            }
        }
        return rels;
    };

    // append statements from one graph object to another
    var appendGraph = function(toGraph, fromGraph, docURI) {
        var why = (docURI)?$rdf.sym(docURI):undefined;
        fromGraph.statementsMatching(undefined, undefined, undefined, why).forEach(function(st) {
            toGraph.add(st.subject, st.predicate, st.object, st.why);
        });
    };

    return {
        parseLinkHeader: parseLinkHeader,
        appendGraph: appendGraph,
    };
}(this));
// LDP operations
var Solid = Solid || {};
// Init some defaults;
Solid.config = {};
Solid.config.proxyUrl = "https://databox.me/,proxy?uri={uri}";
Solid.config.timeout = 5000;

Solid.web = (function(window) {
    'use strict';

    $rdf.Fetcher.crossSiteProxyTemplate = Solid.config.proxyUrl;
    // common vocabs
    var LDP = $rdf.Namespace("http://www.w3.org/ns/ldp#");

    // return metadata for a given request
    var parseResponseMeta = function(resp) {
        var headers = resp.headers;
        var meta = {};
        var link = Solid.utils.parseLinkHeader(headers.get('Link'))
        if (link) {
          meta.acl = link['acl'];
          meta.meta = link['meta'] ? link['meta'] : link['describedBy'];
        }
        meta.url = headers.has('Location') ? headers.get('Location') : resp.url;
        meta.user = headers.has('User') ? headers.get('User') : '';
        meta.websocket = headers.has('Updates-Via') ? headers.get('Updates-Via') : '';
        meta.exists = false;
        meta.exists = resp.status === 200 ? true : false;
        meta.xhr = resp;
        return meta;
    };

    // check if a resource exists and return useful Solid info (acl, meta, type, etc)
    // resolve(metaObj)
    var head = function(url) {
        return Solid.fetch(url,{method:'HEAD'}).then((response) => {
          // let result = response;
          // if (response.ok)
            return parseResponseMeta(response);
        });
    };

    // fetch an RDF resource
    // resolve(graph) | reject(this)
    var get = function(url) {
        var promise = new Promise(function(resolve, reject) {
            var g = new $rdf.graph();
            var f = new $rdf.fetcher(g, Solid.config.timeout);

            var docURI = (url.indexOf('#') >= 0)?url.slice(0, url.indexOf('#')):url;
            f.nowOrWhenFetched(docURI,undefined,function(ok, body, xhr) {
                if (!ok) {
                    reject({status: xhr.status, xhr: xhr});
                } else {
                    resolve(g);
                }
            });
        });

        return promise;
    };

    // create new resource
    // resolve(metaObj) | reject
    var post = function(url, slug, data, isContainer) {
        var resType = (isContainer)?LDP('BasicContainer').uri:LDP('Resource').uri;
        var init = {
                    method: 'POST',
                    headers : {
                       'Content-Type': 'text/turtle',
                       'Link': '<'+resType+'>; rel="type"'
                    },
                    credentials: 'include',
                   }
        if (slug && slug.length > 0) {
          init.headers['Slug'] = slug;
        }
        if (data && data.length > 0) {
          init['body'] = data;
        }

        var promise = Solid.fetch(url, init)
               .then((resp) => {
                  if (resp.status === 200 || resp.status === 201) {
                    return Promise.resolve(parseResponseMeta(resp))
                  } else {
                    return Promise.reject({status: resp.status, msg: resp.statusText})
                  }
               })
        return promise;
    };


    // update/create resource using HTTP PUT
    // resolve(metaObj) | reject
    var put = function(url, data, type) {
        let contentType = type || 'text/turtle'
        var init = {
                    method: 'PUT',
                    headers : {
                       'Content-Type': contentType,
                    },
                    credentials: 'include',
                   }
        if (data && data.length > 0) {
          init['body'] = data;
        }

        var promise = Solid.fetch(url, init)
               .then((resp) => {
                  if (resp.status === 200 || resp.status === 201) {
                    return Promise.resolve(parseResponseMeta(resp))
                  } else {
                    return Promise.reject({status: resp.status, msg: resp.statusText})
                  }
               })
        return promise;
    };

    // delete a resource
    // resolve(true) | reject
    var del = function(url) {
        var init = {
                    method: 'DELETE',
                    credentials: 'include',
                   }
        var promise = Solid.fetch(url, init)
               .then((resp) => {
                  if (resp.status === 200 || resp.status === 202 || resp.status === 204) {
                    return Promise.resolve(true)
                  } else {
                    return Promise.reject({status: resp.status, msg: resp.statusText})
                  }
               })
        return promise;
    }

    // return public methods
    return {
        head: head,
        get: get,
        post: post,
        put: put,
        del: del,
    };
}(this));
