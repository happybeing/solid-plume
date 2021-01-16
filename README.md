# Plume

<img src="https://deiu.github.io/solid-plume/img/logo.png">

*Plume* is a 100% client-side blogging platform for [Solid](https://solid.mit.edu/), in which data is decoupled from the application itself. This means that you can host the application on any Web server without having to install anything -- no database, no server side code or services to configure.

Plume stores blog posts using Linked Data (RDF) to include *semantic information* about the content it creates, which means that other applications can understand, edit and even create Plume posts without using a custom API. This leads to some of the key innovations and advantages of Solid:

- It becomes possible to replace Plume with another blogging application that understands Linked Data, so you are no longer tied to using the application which you used to create your content.
- Other applications which understand Linked Data can re-use content  created by Plume in ways that allow them to present the information meaningfully, to search and refine it, and mash it together with other data (public or private) in the growing *Semantic Web*.

Plume uses [Markdown](https://en.wikipedia.org/wiki/Markdown) which makes it easy to write beautiful articles without learning a whole new editor.

## Deploying Plume

Plume can be deployed on any web server, but the simplest way is to upload it to your Solid pod and serve it from there where it will also store the blog posts you create.

### Deploy Plume to your pod

To deploy Plume on a Solid pod, see the step-by-step guide online at [Plume Deployment Guide](https://thewebalyst.solidcommunity.net/plume/?post=https%3A%2F%2Fthewebalyst.solidcommunity.net%2Fpublic%2Fposts%2F%2F1555171264494-how-to-deploy-plume-blog-on-your-solid-pod.ttl)

You can try creating a Plume blog using a free Solid pod service such as [https://solidcommunity.net](https://solidcommunity.net) or [https://www.inrupt.net/](https://www.inrupt.net/).

## Configuration

### Configuring Plume
Plume does not support dynamic configuration of data spaces, which means you will have to either run it on your own Web server or manually upload it to your Solid pod as described in the [Plume Deployment Guide](https://thewebalyst.solidcommunity.net/plume/?post=https%3A%2F%2Fthewebalyst.solidcommunity.net%2Fpublic%2Fposts%2F%2F1555171264494-how-to-deploy-plume-blog-on-your-solid-pod.ttl).

The guide explains how to configure Plume using a file called 'config.txt' which is used to identify yourself as pod owner (by your pod WebID). This file also allows you to configure where posts are to be stored, the title and strapline for your blog, and so on. All these settings can be changed at any time by editing 'config.txt'.

The following is an example which is included with Plume as 'config-example.txt':

```
{
    "owners": [
        "https://localhost:8443/profile/card#me"
    ],
    "title": "Plume (theWebalyst)",
    "tagline": "Light as a feather",
    "picture": "img/logo.svg",
    "fadeText": true,
    "showSources": true,
    "cacheUnit": "days",
    "defaultPath": "public/posts",
    "postsURL": "https://localhost:8443/public/posts/",
    "postsElement": ".posts",
    "loadInBg": true
}
```

The minimum customisation needed will be to replace the two instances of '`https://localhost:8443/`' with the first part of your pod storage address (e.g. with '`https://thewebalyst.solidcommunity.net/`').

The meanings of 'config.txt' parameters are as follows:

* `owner`: a list of URLs (WebIDs) of the people who can post on the blog
* `title`: the title of the blog
* `tagline`: tagline/subtitle
* `picture`: the picture to display on the blog's header
* `fadeText`: true/false - shortens the posts length when viewing the full blog
* `showSources`: true/false - it will add a button/link that points to the source of the blog post (the actual resource)
* `cacheUnit`: minutes/hours/days/ - validity of certain cached data (you shouldn't really need to change it)
* `defaultPath`: this value will be suggested to the user if the blog needs to be initialized
* `postsURL`: the URL of the directory (container) holding the posts for the blog
