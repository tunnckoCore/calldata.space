// https://api-next.ordex.io/item/search - POST request to get collection items metadata (use collection slug)
// https://api-next.ordex.io/collection/all - all collection slugs
// https://api-next.ordex.io/collection/ETHEREUM_ETHSCRIPTION:mfpurrs - collection useless data

import { sha256, toHex } from 'viem';

// example with smaller collection (but works for bigger)
// callback fired on each item of the collection
// getCollectionMetdata('0xneko-og', async (_acc, tx: any) => {
//   console.log(tx);
// });

// const collection = await fetchCollectionMeta('mickey-mouse');
// collection.items = await getCollectionMetdata('mickey-mouse', (acc, item) => acc.concat(item));

// console.log('mickey-mouse', collection);

export async function getCollectionMetdata(collectioName: string, reducer: any) {
  const res = await fetchCollectionPage(collectioName);

  if (res.rest.statusCode && res.rest.errors) {
    throw new Error(res.rest.errors[0].message);
  }

  let results: any = [];

  for (const tx of res.result) {
    results = await reducer(results, tx);
  }

  while (res.pagination.has_more) {
    console.log('has more... page_key:', res.pagination.page_key);

    const next = await fetchCollectionPage(collectioName, res.pagination.page_key);

    for (const tx of next.result) {
      results = await reducer(results, tx);
    }

    res.pagination = next.pagination;
  }

  return results;
}

// fetchCollectionMeta('ittybits').then(console.log);

export async function fetchCollectionMeta(collectionName: string) {
  const resp = await fetch(
    `https://api-next.ordex.io/collection/ETHEREUM_ETHSCRIPTION:${collectionName}`,
  );

  const {
    meta: { name: _name, slug, description, socialLinks, royalty, content, ...bruh },
    ...rest
  } = await resp.json();
  const name = _name.replace(/-/g, ' ');
  const links = socialLinks.map(({ link }) => link);
  // console.log({ royalty, rest, bruh });

  const royalties = royalty.account ? { [royalty.account]: royalty.value / 100 } : {};
  const logo = content[0]?.url || '';
  const team = [royalty?.account].filter(Boolean);

  return { name, slug, description, links, royalties, team, logo, items: [] };
}

export async function fetchCollectionPage(collectioName: string, continuation = '') {
  const resp = await fetch('https://api-next.ordex.io/item/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      size: 100,
      filter: {
        blockchains: ['ETHEREUM_ETHSCRIPTION'],
        collections: [`ETHEREUM_ETHSCRIPTION:${collectioName}`],
        owners: [],
        traits: [],
        names: [],
      },
      sort: 'LOWEST_SELL',
      continuation,
    }),
  });

  const { continuation: page_key, items, ...rest } = await resp.json();

  const result = items.map(
    ({
      id,
      creators,
      owner,
      meta: { name, description = '', attributes, content, rawContent, number },
    }: any) => ({
      name,
      description,
      creator: creators[0].account.replace('ETHEREUM:', ''),
      current_owner: owner.replace('ETHEREUM:', ''),
      ethscription_number: number,
      transaction_hash: id.replace('ETHEREUM_ETHSCRIPTION:', ''),
      attributes,
      content_type: content[0].mimeType,
      content_sha: sha256(toHex(rawContent)),
      content_uri: rawContent,
    }),
  );

  return { pagination: { has_more: !!page_key, page_key }, result, rest };
}
