# ethscriptions server

**Part of the [Calldata.Space](https://calldata.space) Project**

> Ethscriptions API Cache Proxy. A Cloudflare Worker that caches and unifies Ethscriptions (or any
> other) API's responses, according to ESIP-9. Includes support for estimating gas costs, resolving
> ENS on-chain / off-chain names, and Ethscriptions names.

Go to [mainnet.api.calldata.space](https://mainnet.api.calldata.space) for more info and the
available endpoints

You can also use it as a NPM module or just use the
[`ethscriptions` library](https://npmjs.com/package/ethscriptions).

The server uses [Hono](https://hono.dev) and exports Hono instance. You can practically deploy it
everywhere.

```ts
import { createApp, withRoutes, createRouteHandlers } from 'ethscriptions-server';

// for Bun/Deno/Cloudflare - it's just Hono instance;
export default withRoutes(createApp());

// for Next.js on Vercel - use Next.js API Routes;
// import { handle } from 'hono/vercel' = default `handle` adapter
export const { GET, POST, OPTIONS } = createRouteHandlers('https://api.ethscriptions.com/v2');
```

For other frameworks, you should pass third argument a different `handle` adapter from Hono

```ts
import { createRouteHandlers } from 'ethscriptions-server';
import { handle } from 'jsr:@hono/hono/netlify';

export const { GET, POST, OPTIONS } = createRouteHandlers(
  'https://api.ethscriptions.com/v2',
  null,
  handle,
);
```

## License

Released under the MPL-2.0 License.
