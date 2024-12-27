# ethscriptions [![npm version][npmv-img]][npmv-url] [![License][license-img]][license-url] [![Libera Manifesto][libera-manifesto-img]][libera-manifesto-url]

[npmv-url]: https://www.npmjs.com/package/ethscriptions
[npmv-img]: https://badgen.net/npm/v/ethscriptions?icon=npm
[license-url]: https://github.com/tunnckoCore/ethscriptions/blob/master/LICENSE.md
[license-img]: https://badgen.net/npm/license/ethscriptions
[libera-manifesto-url]: https://liberamanifesto.com
[libera-manifesto-img]: https://badgen.net/badge/libera/manifesto/grey
[bitcoin-ready-url]: https://bitcoin.org
[bitcoin-ready-img]: https://badgen.net/badge/bitcoin/ready/orange
[prs-welcome-img]: https://badgen.net/badge/PRs/welcome/green
[prs-welcome-url]: http://makeapullrequest.com
[last-commit-img]: https://badgen.net/github/last-commit/tunnckoCore/calldata.space
[last-commit-url]: https://github.com/tunnckoCore/calldata.space/commits/master
[codestyle-url]: https://github.com/airbnb/javascript
[codestyle-img]:
  https://badgen.net/badge/code%20style/airbnb%20%2B%20prettier/ff5a5f?icon=airbnb&cache=300

[![Code style][codestyle-img]][codestyle-url]
[![bunning](https://github.com/tunnckoCore/ethscriptions/actions/workflows/ci.yml/badge.svg)](https://github.com/tunnckoCore/ethscriptions/actions/workflows/ci.yml)
[![Make A Pull Request][prs-welcome-img]][prs-welcome-url]
[![Time Since Last Commit][last-commit-img]][last-commit-url]

**Part of the [Calldata.Space](https://calldata.space) Project**

Library with utility functions for Ethscriptions. Supports for fetching user profiles, filtering
ethscriptions, and resolving names & ENS builtin.

You can use this library to fetch from the official upstream Ethscriptions API, or you can use a
different compatible one. You can also use it to build a proxy API, like the one hosted at
https://api.wgw.lol which is using this library under the hood.

## Installation

```bash
npm install ethscriptions
```

## Usage

All functions return a promise that resolves to an object with the `result` and `headers`, or with
object with `error` when there is failure, they never throw in most cases. The `headers` object is
primarily used for API responses and contains predefined CDN Cache Control headers with different
max age depending on the thing.

To all options object you can pass custom `headers` and `baseURL`. By default we use
`cdn-cache-control` for headers, and `https://api.ethscriptions.com/v2` as base api url.

```ts
// or you can use the typescript files directly
// import { resolveUser } from 'ethscriptions/index.ts';
// import * as utils from 'ethscriptions/utils.ts';

import type {
  NotOkShape,
  EthscriptionBase,
  EthscriptionTransfer,
  ResolveUserResult,
} from 'ethscriptions/types';

import { getPrices, namesResolver } from 'ethscriptions/utils';
import {
  checkExists,
  getDigestForData,
  resolveUser,
  getUserProfile,
  getUserCreatedEthscritions,
  getUserOwnedEthscriptions,
  getAllEthscriptions, // supports filters
  getEthscriptionById, // supports `with` and `only` filters
  getEthscriptionDetailed, // supports `with` and `only` filters
} from 'ethscriptions';

// get all blobscriptions only
const blobs = await getAllEthscriptions({ attachment_present: true });
// => { result, pagination, headers } | { error: { message, httpStatus } }

const resolveEnsWithAddress = await resolveUser('0xa20c07f94a127fd76e61fbea1019cce759225002');
// => result: {
//   name: "tunnckocore.eth",
//   address: "0xa20c07f94a127fd76e61fbea1019cce759225002",
// }

const resolveWithEns = await resolveUser('ckwf.cb.id');
// => result: {
//   name: "ckwf.cb.id",
//   address: "0x2303f59c6ed6176b04a48e66dad01370e175cc89",
// }

const ensUser = await resolveUser('dubie.eth'); // ens
const ensUser2 = await resolveUser('barry.wgw.lol'); // off-chain ens
const ensUser3 = await resolveUser('mfers.base.eth');
const ethscriptionName = await resolveUser('wgw'); // => wgw's address (0xA20C...)
const creatorOfEthscriptionName = await resolveUser('wgw', { checkCreator: true }); // => hirsh's address (0x205...)
const ethscriptionName = await resolveUser('59.eths');
const ethscriptionName = await resolveUser('ordex.tree');

// get user's ethscription proifle (latest state and all previous changes)
const userProfile = await getUserProfile('wgw');
// => {
//   result: { latest, previous }
//   headers // used for API
// }

const digest = await getDigestForData('data:,foobar');
// => result: { sha, hex, input: 'data:,foobar' }

const digestWithExists = await checkExists('data:,foobar', { checkExists: true });
// => result: { sha, hex, input: 'data:,foobar', exists: boolean, ethscription: Ethscription }

// or use them separately
const exists = await checkExists(digest.result?.sha);
// => { result: { exists, ethscription } }

const userCreated = await getUserCreatedEthscritions('barry.wgw.lol');
// => { result, pagination, headers } | { error: { message, httpStatus } }

// to paginate further, you can repeat the same but passing `pagination.page_key` to the options

const nextUserCreatedPage = await getUserCreatedEthscritions('barry.wgw.lol', {
  page_key: userCreated.pagination.page_key,
});

// same apply for `getUserOwnedEthscriptions` and `getAllEthscriptions`, they all support pagination and filters
// for example, to get all ethscriptions created by `wgw` (or `wgw.eth` ens name) that are of type `application/json`
// const filtered = await getAllEthscriptions({ creator: 'wgw.eth', content_type: 'application/json' });
const filtered = await getAllEthscriptions({ creator: 'wgw', content_type: 'application/json' });

// or by passing `media_type: 'image'` only images will be returned, paginated
const images = await getAllEthscriptions({ media_type: 'image' });

// get ethscription by id or ethscription number
const ethscription = await getEthscriptionById('14'); // a punk
// => { result, headers } | { error: { message, httpStatus } }

// get ethscription by id or ethscription number, with filters on the returned result,
// use with to include more fields that you know are from the upstream API,
// then you need to also include them in the `only` if they don't exist in here (check noralizeResult)
const detailed = await getEthscriptionById('1559', {
  with: 'content_uri,current_owner',
  only: 'transaction_hash,content_uri,creator,current_owner',
});
// => {
// result: {
//     transaction_hash: "0xeec9936d3f5317c756beb22de6c65e3af93632e33324460820a780ee1c359399",
//     creator: "0x1db5b9b9446ec05d83447b269172c705db3963a6",
//     content_uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAoklEQVR42mNgGAVUBP+RMPUNDg0NhWNqWoRiMDqm1BK8hlNqCVGGk2sJrvDGwORagqLp9sYGnBhdLUkWEDIc3RJiLcDq+mV5OmCMbDBMjFRfYHU9iH9pbgJWMeT4INsCQkFErAUYqYYUC4ixhCgL0OWobgHNfUBTC7DJkWIBhiXUTkUkW0Cq4QQzG64Cj6zSFETfv38fjqlRihLlAyxFOF4AAME2Vco1GfJAAAAAAElFTkSuQmCC",
//     current_owner: "0xc33f8610941be56fb0d84e25894c0d928cc97dde",
//   },
//   headers
// }

// all owners - current, previous, initial owner, latest transfer info
const detailed = await getEthscriptionDetailed('1559', 'owners');
// => {
// result": {
//     "latest_transfer_timestamp":"1687565975",
//     "latest_transfer_datetime": "2023-06-16T21:50:47.000Z",
//     "latest_transfer_block":"17545784",
//     "creator":"0x1238f8749d631dc145b98cdc8c49d4011cf075a8",
//     "initial":"0x1238f8749d631dc145b98cdc8c49d4011cf075a8",
//     "current":"0x0408c3841cf660e0a7edc7278161d339a81de19e",
//     "previous":"0x1238f8749d631dc145b98cdc8c49d4011cf075a8"
//   }
// }

// get only transfers of given ethscription
const { result } = await getEthscriptionDetailed(
  '0x1cad3901d55cbeb93d3550b052c68b2ea3b0fddfc8bb0d5b80f5e8260f8dc603',
  'transfers',
);

// => result: [{
//   "transaction_hash":"0x89eded54b9baa5873a5ad3f8d82562e5e765005a7aa0cecf14b1d8ba6abe0d5c",
//   "from_address":"0x1238f8749d631dc145b98cdc8c49d4011cf075a8",
//   "to_address":"0x0408c3841cf660e0a7edc7278161d339a81de19e",
//   "block_number":"17545784",
//   "block_timestamp":"1687565975",
//   "block_blockhash":"0x0bc57195d695f62e1b8117af8bc80520579f7e43eb3a2e70250fc5b8af36e28a",
//   "event_log_index":null,
//   "transfer_index":"0",
//   "transaction_index":"56",
//   "enforced_previous_owner":null,
//   "is_esip0":false,
//   "is_esip1":false,
//   "is_esip2":false
// }]

// get ethscription number, and other number info & stats, second arg can be `info/stats/index/number`
const info = await getEthscriptionDetailed('444', 'info');
// =>
//   result: {
//     block_timestamp: '1686952247',
//     block_datetime: '2023-06-16T21:50:47.000Z',
//     block_blockhash: '0x7d752820b6c561f399b0f47acaa14b490e19fc6e222e2e0fc76ad689fb40b8f7',
//     block_number: '17495179',
//     block_number_fmt: '17,495,179',
//     transaction_index: '131',
//     event_log_index: null,
//     ethscription_number: '444',
//     ethscription_number_fmt: '444',
//     ethscription_transfers: '1',
//   },
// };

// get blob content of the ethscription if it is ESIP-8 blobscription, second arg can be `attachment/blob`
const blobscription = await getEthscriptionDetailed('6040646', 'attachment');
// => { result: Uint8Array, headers }
```

## License

Released under the MPL-2.0 license.
