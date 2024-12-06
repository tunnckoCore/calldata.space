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
  content_type: `${string}/${string}`;
  content_sha: `0x${string}`;
  content_path: `/ethscriptions/${`0x${string}` | `${number}`}/content`;
  is_esip0: boolean;
  is_esip3: boolean;
  is_esip4: boolean;
  is_esip6: boolean;
  is_esip8: boolean;
  ethscription_number: `${number}`;
  current_owner: `0x${string}`;
};

export async function getAllEthscriptionsByType({
  reducer,
  baseURL = 'api.wgw.lol',
  mediaType = 'image',
}: {
  reducer: (results: any[], tx: Ethscription, mediaType: string) => Promise<any[]>;
  mediaType?: string;
  baseURL?: string;
}) {
  // &transaction_hash_only=true&max_results=1000
  const endpointUrl = `https://${baseURL}/ethscriptions?max_results=50&media_type=${mediaType}&reverse=true&with=ethscription_number,current_owner`;
  const res = await fetch(endpointUrl).then((x) => x.json());

  let results = [];

  for (const tx of res.result) {
    results = await reducer(results, tx as Ethscription, mediaType);
  }

  while (res.pagination.has_more) {
    console.log('has more... page_key:', res.pagination.page_key);

    const next = await fetch(`${endpointUrl}&page_key=${res.pagination.page_key}`).then((x) =>
      x.json(),
    );

    for (const tx of next.result) {
      results = await reducer(results, tx as Ethscription, mediaType);
    }

    res.pagination = next.pagination;
  }

  return results;
}
