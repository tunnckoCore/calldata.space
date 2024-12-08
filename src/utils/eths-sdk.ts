import 'server-only';

import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
// import { unstable_cacheLife } from "next/cache";
import { connection } from 'next/server';
import pMap from 'p-map';
import { adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator';

export type Ethscription = {
  block_number: `${number}`;
  block_blockhash: `0x${string}`;
  block_timestamp: `${number}`;
  block_datetime: string;
  transaction_hash: `0x${string}`;
  transaction_index: `${number}`;
  transaction_value: `${number}`;
  transaction_fee: `${number}`;
  gas_price: `${number}`;
  gas_used: `${number}`;
  creator: `0x${string}`;
  receiver: `0x${string}`;
  media_type: string;
  media_subtype: string;
  content_type: string;
  content_sha: `0x${string}`;
  content_path: `/ethscriptions/${`0x${string}` | `${number}`}/content`;
  is_esip0: boolean;
  is_esip3: boolean;
  is_esip4: boolean;
  is_esip6: boolean;
  is_esip8: boolean;
};

export type EthItem = {
  id: number;
  name: string;
  ethscription: Ethscription;
};

export type EthItemPair = [EthItem, EthItem];

export function getRand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function getEthscription(id: number): Promise<Ethscription> {
  const res = await fetch(`https://api.wgw.lol/ethscriptions/${id}`).then((x) => x.json());

  return res.result;
}

// trimTxHashes();

export async function trimTxHashes() {
  const dir = resolve(process.cwd(), './public/txs');
  const hashes = await readdir(dir);

  const trimmed = hashes.map((hash) => hash.slice(0, 10));

  console.log(JSON.stringify(trimmed));
}

// getEthsMeta();

export async function getEthsMeta() {
  // "use cache";
  // unstable_cacheLife("forever");

  const dir = resolve(process.cwd(), './public/txs');
  const hashes = await readdir(dir);

  const toprocess: any = [];
  const processed: any = [];

  await pMap(
    hashes,
    async (hash) => {
      const file = Bun.file(join(dir, hash));
      const text = await file.text();

      if (text.length > 0) {
        processed.push(hash);
        return;
      }

      toprocess.push(hash);
    },
    { concurrency: 200 },
  );

  console.log({ processed: processed.length, toprocess: toprocess.length });

  let cnt = 0;

  for (const hash of hashes) {
    cnt++;
    const res = await fetch(
      `https://api.wgw.lol/ethscriptions/${hash}?with=ethscription_number`,
    ).then((x) => x.json());
    let eid;

    if (res.error) {
      let resp;

      try {
        resp = await fetch(`https://api.ethscriptions.com/v2/ethscriptions/${hash}`);
        console.log('resp:', resp.status, resp.statusText);

        if (resp.status === 200) {
          resp = await resp.json();
        } else {
          resp = false;
        }
      } catch (err: any) {
        console.log('error fetching...', err);
        return;
      }

      if (resp && resp.result) {
        eid = resp.result.ethscription_number;
      } else {
        return;
      }
    } else {
      eid = res.result.ethscription_number;
    }

    await Bun.write(join(dir, hash), eid);
    console.log(cnt, 'txhash:', hash, 'ethscription_number:', eid);

    // if (cnt % 1000 === 0) {
    //   console.log('slowing down for 5 seconds...')
    //   await new Promise((resolve) => setTimeout(resolve, 10_000));
    // }
  }

  // await pMap(toprocess as string[], async (hash: string, idx) => {
  //   const res = await fetch(`https://api.wgw.lol/ethscriptions/${hash}?with=ethscription_number`).then((x) => x.json());
  //   let eid;

  //   if (res.error) {
  //     let resp;

  //     try {
  //       resp = await fetch(`https://api.ethscriptions.com/v2/ethscriptions/${hash}`);
  //       console.log('resp:', resp.status, resp.statusText)

  //       if (resp.status === 200) {
  //         resp = await resp.json();
  //       } else {
  //         resp = false;
  //       }
  //     } catch (err: any) {
  //       console.log('error fetching...', err)
  //       return;
  //     }

  //     if (resp && resp.result) {
  //       eid = resp.result.ethscription_number;
  //     } else {
  //       return;
  //     }
  //   } else {
  //     eid = res.result.ethscription_number;
  //   }

  //   await Bun.write(join(dir, hash), eid);
  //   console.log(idx, 'txhash:', hash, 'ethscription_number:', eid);
  //   cnt++;

  //   if (cnt % 1000 === 0) {
  //     console.log('slowing down for 5 seconds...')
  //     await new Promise((resolve) => setTimeout(resolve, 10_000));
  //   }
  // }, { concurrency: 10 });

  // const hashes = fg.sync(['./public/txs/*'], { onlyFiles: true, objectMode: true });

  // for await (const entry of stream) {
  //   console.log('txhash:', entry.name)
  //   const res = await fetch(`https://api.wgw.lol/ethscriptions/${entry.name}?with=ethscription_number`).then((x) => x.json());
  //   console.log(res.result);
  //   // .editorconfig
  //   // services/index.js
  // }
}

export async function getAllEthscriptionHashesForType({
  reducer,
  mediaType = 'image',
  baseURL = 'api.wgw.lol',
}: {
  reducer: (results: any[], tx: Ethscription, mediaType: string) => Promise<any[]>;
  mediaType?: string;
  baseURL?: string;
}) {
  const res = await fetch(
    `https://${baseURL}/ethscriptions?media_type=${mediaType}&transaction_hash_only=true&max_results=1000&reverse=true`,
  ).then((x) => x.json());

  let results: any = [];

  for (const tx of res.result) {
    results = await reducer(results, tx as Ethscription, mediaType);
  }

  while (res.pagination.has_more) {
    console.log('has more... page_key:', res.pagination.page_key);

    const next = await fetch(
      `https://${baseURL}/ethscriptions?media_type=${mediaType}&transaction_hash_only=true&max_results=1000&reverse=true&page_key=${res.pagination.page_key}`,
    ).then((x) => x.json());

    for (const tx of next.result) {
      results = await reducer(results, tx as Ethscription, mediaType);
    }

    res.pagination = next.pagination;
  }

  return results;
}

export async function getTwoRandomEthscriptions(): Promise<EthItemPair> {
  // "use cache";
  // unstable_cacheLife("forever");

  const left = await getRandomImageEthscription();
  const right = await getRandomImageEthscription(left.id);

  return [left, right] as EthItemPair;
}

export async function getRandomImageEthscription(notlike?: number): Promise<EthItem> {
  let left: any = true;

  do {
    const rndNumber = getRand(0, 3_000_000);

    // NOTE: if it is the same as the passed `notlike` number, then skip
    if (notlike && typeof notlike === 'number' && rndNumber === notlike) {
      console.log('skipping... same number');
      left = true;
    } else {
      let res;

      // NOTE: usually not needed with the WGW API, but safety reasons
      try {
        res = await fetch(`https://api.wgw.lol/ethscriptions/${rndNumber}`).then((x) => x.json());
      } catch (err: any) {
        console.log('error fetching...', err);
        // NOTE: if errors for any reason, skip
        left = true;
      }

      // NOTE: if errors for any reason, skip; also if not an image, skip
      if (left === true || res.error || (res.result && res.result.media_type !== 'image')) {
        console.log(
          'skipping... error or not an image',
          res.error || res.result?.transaction_hash,
          rndNumber,
        );
        left = true;
      } else {
        const name: string = uniqueNamesGenerator({
          dictionaries: [colors, adjectives, animals],
          style: 'capital',
          separator: ' ',
        });

        left = { id: rndNumber, name, ethscription: res.result };
      }
    }
  } while (left === true);

  return left as EthItem;
}

export async function getTwoRandom() {
  await connection(); // Next needed some help knowing this is dynamic

  return [];
  // return await getTwoRandomEthscriptions();
}

// const results = await getAllEthscriptionHashesForType('video', 'api.ethscriptions.com/v2');
