# SAFE Plume

This is a simple blog app for SAFE Network, created by forking Solid Plume, a blog which allowed the owner to store their data on a Solid server of their choice.

The purpose of SAFE Plume is to that combining SAFE Network and Project Solid can deliver key features of both. SAFE Plume was used to demonstrate this at the first SAFE Network European DevCon in Ayr, Scotland (April 23rd, 2018). The presentation included background on Project Solid, how it can enhance SAFE Network, and demonstrated how easy it is to add RESTful interfaces to SAFE Network. 

The key innovations demonstrated at the SAFE DevCon were:

- that a Solid application can work on SAFE Network with little, or potentially no modification at all, just by incorporating a nodejs library ( [safenetwork-webapi](https://github.com/theWebalyst/safenetwork-webapi))
- that the same technique can be used to add support for any RESTful web protocol, making it easy for web app developers to utilise SAFE Network using simple, known web protocols (such as WebDav, LDP, FTP, SMTP etc.). This avoids the need to learn the necessarily complex and unfamiliar [SAFE DOM API](https://safenetwork.org/documentation/)

## Links
- *Supercharging the SAFE Network with Project Solid,* presented at the SAFE Network European DevCon in Ayr, Scotland (April 23rd, 2018):
  - [Google slides.](https://docs.google.com/presentation/d/1exhGrFrSDrEpEQsZTO23Gn6nZNpdjJ8ooSW2lR_Pp6Y/edit?usp=sharing) This full set of slides is more detailed than the recorded presentation which is available to view online, so it may be helpful to look through the slides alongside viewing the presentation video which includes a live demo of SAFE Plume Blog.
 - [SAFE Network Forum Topic](https://forum.safedev.org/t/proposals-for-restful-service-handling/1550?u=happybeing) including the video played at the DevCon and forum Q&A about the presentation.
- Follow me on twitter at [SAFE and SoLiD](https://twitter.com/safepress)
- Search twitter for [#SAFEDevCon18](https://twitter.com/search?q=%23SAFEDevCon18&src=typd)

## Background
[SAFE Network](https://maidsafe.net) is the world's first autonomous network, and a truly decentralised internet platform which is designed to be secure from the bottom up.

[SoLiD](http://solid.mit.edu/) (SOcial LInked Data) is a project to create a read-write web in which users retain control of their data and can switch seamlessly between applications. It also makes data crawlable, searchable and semantic.

# Solid Plume

<img src="https://deiu.github.io/solid-plume/img/logo.png">

This is a fork of *Plume* modified to work with the *SAFE Network* through a library which allows any Solid app to store its data in the user's own *SAFE Network* storage - an alternative to web based storage on a Solid server. The *SAFE Network* is the world's first autonomous network, a secure, decentralised storage and communications platform being developed by Scottish company http://maidsafe.net.

NOTE: This project is a work in progress, and the instructions below have not been updated for use with *SAFE Network* storage yet. So they refer to the original *Plume* application and configuration for use with a Solid server data store. That will probably not work with this fork, although the ultimate aim is make it as easy as possible to switch between storage on a Solid server and *SAFE Network*! You can follow development by watching this repo, or following the author on twitter.com/safepress

__

*Plume* is a 100% client-side blogging platform, built using [Solid standards](https://github.com/solid/), in which data is decoupled from the application itself. This means that you can host the application on any Web server, without having to install anything -- no database, no messing around with Node.js, it has 0 dependencies! It also means that other similar applications will be able to reuse the data resulting from your posts, without having to go through a complicated API.

Plume uses [Markdown](https://en.wikipedia.org/wiki/Markdown) to provide you with the easiest and fastest experience for writing beautiful articles.

It currently does not support dynamic configuration of data spaces, which means you will have to either run it on your own Web server, or manually upload it to your account -- you can use [https://databox.me]( https://databox.me) as storage. The next version will allow you to run it from Github, like all the other [Solid apps](https://github.com/solid/solid-apps) we currently offer.

## Configuration

Before being able to use Plume, you will have to manually set some config values. First you need to copy/rename the `config-example.json` file to `config.json`. Then you need to set the `postsURL` value to have it point to an **existing** container on a [Solid-friendly server](https://github.com/solid/solid-platform) that holds your blog posts. Finally, you should also set the `owners` variable by adding your own WebID, in order to be able to access the editor UI and to create new posts.

Here is an example of the configuration file:

```
{
    "owners": ["https://example.org/profile#me"],
    "title": "Plume",
    "tagline": "Light as a feather",
    "picture": "img/logo.svg",
    "fadeText": true,
    "showSources": true,
    "cacheUnit": "days",
    "defaultPath": "posts",
    "postsURL": "https://account.databox.me/Public/blog/posts/"
}
```

Here is what each config parameter means:

* `owner`: a list of URLs (WebIDs) of the people who can post on the blog
* `title`: the title of the blog
* `tagline`: tagline/subtitle
* `picture`: the picture to display on the blog's header
* `fadeText`: true/false - shortens the posts length when viewing the full blog
* `showSources`: true/false - it will add a button/link that points to the source of the blog post (the actual resource)
* `cacheUnit`: minutes/hours/days/ - validity of certain cached data (you shouldn't really need to change it)
* `defaultPath`: this value will be suggested to the user if the blog needs to be initialized
* `postsURL`: the URL of the folder (container) holding the posts for the blog
