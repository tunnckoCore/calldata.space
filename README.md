# Calldata.Space

The Open Source platform to learn, explore, create, and trade any EVM calldata be it Ethscriptions,
Blobscriptions, or Facet.

## Ethscriptions Library

There is a NPM package library called `ethscriptions` that you can use to interact with the
Ethscriptions Protocol. You can find it at
[tunnckocore/ethscriptions-core](https://github.com/tunnckocore/ethscriptions).

_Soon it could be renamed to `@calldata.space/core`._

## Ethscriptions Server & API

You can find it at
[tunnckocore/ethscriptions-server](https://github.com/tunnckocore/ethscriptions-server).

There is a NPM package called `ethscriptions-server` that you can use to run your own server similar
to the one that we currently host at [api.wgw.lol](https://api.wgw.lol). It's a thin layer on top of
the official Ethscriptions API, but solving a lot of problems and adding a lot of features, like
image optimizer and converter, ethscribe data cost estimation, SHA256 generation and checking for
existance, aggressive caching of responses, resolving of Ethscription profiles and ENS domains,
standardized responses and input validation, and many more things. It also implements the propsed
[ESIP-9 for standardizing the `/content` and `/metadata` endpoints](https://github.com/ethscriptions-protocol/ESIP-Discussion/issues/18),
allowing for the so-called "recursion". If all parties implement it, we can start having insanely
cool and powerful primitive and composite Ethscriptions, and all that be visible on all platforms
that support the ESIP-9.

It uses the `ethscriptions` library under the hood, and the `hono` web framework which is portable
and allows the server to e deployed on any platform, be it Fly.io, CloudFlare Workers, Deno Deploy,
Vercel, or even your own machine.

_Soon it could be renamed to `@calldata.space/server` and host it on `api.calldata.dev` on launch._

## Ethscriptions/Blobscriptions TypeScript Indexer

You can self-host it on your own infrastructure, or on a cloud provider like Fly.io. It's a simple
listener using the `viem` web3 library, that listens for new Ethscriptions on the Ethereum
blockchain and indexes them in a SQL or KV database, or S3-compatible storage. It also handles the
sending of Server-Sent Events, Webhooks and WebSockets, allowing for real-time updates and easy
integration by any developer stack.

It supports **ALL** ESIPs, except the Facet v1 (the old Dumb Contracts in ESIP-4) which means we can
flag all transactions as being a "facet v1" but we do not actually deal with its state, we just know
whether it is a facet-related transaction or not.

_Soon it could be renamed to `@calldata.space/indexer` and make the API server use it instead._

Currently there's no public source code, but i've built one in the past both for the Ethscriptions,
a Blobscriptions-only indexer, and the BLOB-20 indexer for the BLOB-20 Protocol i've introduced when
we built the ESIP-8 (Blobscriptions). So it's a matter of time to have it ready and public.

The source code for the blobscriptions is actually public and it's with plugin design, allowing for
extensions on top. The one i've created for the Ethscriptions, was pretty much the same idea. You
can find it at [tunnckoCore/blobscriptions](https://github.com/tunnckoCore/blobscriptions). It also
supports sending you Webhooks.

## Learn.Calldata.Space - the Knowledgebase and LearnHub

A place where you can learn about all the things around the Ethscriptions Protocol, the ESIPs, the
Ethscriptions Library, the Ethscriptions Server, the Ethscriptions TypeScript Indexer, and more.
What's the Ethereum calldata, how it works, how facet works. A lot of in-depth tutorials, guides,
examples, articles, and even study the source code of the platform itself.

It will be hosted on https://learn.calldata.space.

## Calldata.Live - the Explorer

_"The Etherscan for Ethscriptions"_

It will be hosted on https://calldata.live and it will be a place where you can explore all the
Ethscriptions in real-time, track ownership history, and see the latest and most popular ones, and
visit the profiles of creators and collections. It will also have a powerful AI search engine based
on the content and the metadata of all the Ethscriptions.

\_Soon it could be renamed to `@calldata.space/explorer` and host it on

## Calldata.Art - the Creator Studio

A more art-focused and user-friendly version of the Explorer.

It will be hosted onn https://calldata.art and will allow you to create your own standalone
Ethscriptions or launch a whole collection and manage it. It will have a powerful editor with a
real-time preview of how your Ethscription will look like on the Ethscriptions Explorer when
ethscribed. It will also handle the minting process, and the royalties, and the metadata generation
while the collection is minting, optimizing your files with the Optimizer, and more.

## Ipx.Calldata.Dev - the Optimizer API

A powerful image and file optimizer and converter that is used by the API server and the Creator
Studio. It is currently hosted on https://ipx.wgw.lol and there is also an endpoint `/optimize` on
the API server (https://api.wgw.lol/optimize), it accepts POST and GET requests and Data URIs or
URLs.
