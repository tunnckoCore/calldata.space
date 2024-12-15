/* eslint-disable unicorn/no-process-exit */
/* eslint-disable unicorn/prefer-top-level-await */
/* eslint-disable promise/prefer-await-to-callbacks */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable drizzle/enforce-delete-with-where */

// import { reset, seed } from 'drizzle-seed';

// import { db, schema } from './index.ts';

// id: sq.integer({ mode: 'number' }),
// block_number: sq.integer(),
// block_blockhash: sq.text(),
// block_timestamp: sq.integer({ mode: 'timestamp' }),
// block_timestamp_ms: sq.integer({ mode: 'timestamp_ms' }),
// block_datetime: sq.text(),
// transaction_hash: sq.text(),
// transaction_index: sq.integer().primaryKey({ autoIncrement: true }),
// transaction_value: sq.blob({ mode: 'bigint' }),
// transaction_fee: sq.blob({ mode: 'bigint' }),
// gas_price: sq.blob({ mode: 'bigint' }),
// gas_used: sq.blob({ mode: 'bigint' }),
// from_address: sq.text(),
// to_address: sq.text(),
// media_type: sq.text(),
// media_subtype: sq.text(),
// content_type: sq.text(),
// content_sha: sq.text(),
// is_esip0: sq.integer({ mode: 'boolean' }),
// is_esip3: sq.integer({ mode: 'boolean' }),
// is_esip4: sq.integer({ mode: 'boolean' }),
// is_esip6: sq.integer({ mode: 'boolean' }),
// is_esip8: sq.integer({ mode: 'boolean' }),
// ethscription_number: sq.integer(),

import { faker } from '@faker-js/faker';
import { toHex } from 'viem';

import { db } from './index.ts';
import {
  CollectionInsertType,
  collections,
  ethscriptions,
  transactions,
  transfers,
  votes,
} from './schema/index.ts';

async function main() {
  // First clear all tables (in correct order due to foreign keys)
  await db.delete(transfers);
  await db.delete(ethscriptions);
  await db.delete(transactions);

  // Generate unique values
  const transactionHashes = Array.from({ length: 100 }, () =>
    faker.string.hexadecimal({ length: 64, prefix: '0x' }).toLowerCase(),
  );

  const addresses = Array.from({ length: 20 }, () =>
    faker.string.hexadecimal({ length: 40, prefix: '0x' }).toLowerCase(),
  );

  const blockHashes = Array.from({ length: 30 }, () =>
    faker.string.hexadecimal({ length: 64, prefix: '0x' }),
  );
  const blockNumbers = Array.from({ length: 30 }, () => faker.number.int({ min: 1000, max: 5000 }));

  const collectionNames = Array.from({ length: 10 }, () => faker.lorem.words(2));
  const randomCollections: CollectionInsertType[] = collectionNames.map(
    (name): CollectionInsertType => {
      const links = Array.from(
        { length: faker.number.int({ min: 0, max: 5 }) },
        () => faker.internet.url() as `https://${string}`,
      );
      const team = Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () =>
        faker.helpers.arrayElement(addresses),
      );

      return {
        // created_at: Date.now(),
        supply: faker.number.int({ min: 30, max: 200 }),
        slug: name.toLowerCase().replaceAll(/\s/g, '-'),
        name,
        description: faker.lorem.sentence(),
        logo: faker.internet.url(),
        banner: faker.internet.url(),
        links,
        team,
        verified: faker.datatype.boolean(),
      };
    },
  ) as CollectionInsertType[];

  const mickeyMouse = {
    // created_at: Date.now(),
    supply: 1928,
    slug: 'mickey-mouse',
    name: 'Mickey Mouse',
    description: `The House of Mickey went Public Domain, so... Mickey Mouse is going enciphered as 64x64 WEBP images, ~900 bytes, with 1928 supply.`,
    logo: 'https://api.wgw.lol/ethscriptions/0x5eacd10493046126e5e1f24e8e34f519b033bcf737a2ba77fb97ea0d94399864/content',
    banner: '',
    links: [
      'https://mickey-mouse-ethscriptions.vercel.app',
      'https://twitter.com/wgw_eth',
      'https://twitter.com/EWildn',
    ],
    team: [
      '0xA20C07F94A127fD76E61fbeA1019cCe759225002',
      'dubie.eth', // on ETH L1 - 0x15719D37d81A0A490AF6B143FFB3c84613d77a7b
      '0xf9081ef394551482c43a68c51c816f4e7999e707', // dubie on ethscriptions
    ],
    royalties: {
      '0xA20C07F94A127fD76E61fbeA1019cCe759225002': 1, // 1%
      '0x15719D37d81A0A490AF6B143FFB3c84613d77a7b': 4, // 4%
    },
    verified: true,
  } as CollectionInsertType;

  // Insert Collections
  // const createdCollections = await db
  //   .insert(collections)
  //   .values([mickeyMouse, ...randomCollections])
  //   .returning();
  const createdCollections = [] as CollectionInsertType[];

  for (const collection of [mickeyMouse, ...randomCollections]) {
    // Insert collections, at random time between them (to simulate real-world data)
    const col = await db.insert(collections).values(collection).returning();
    createdCollections.push(col[0]);

    await new Promise((resolve) => setTimeout(resolve, faker.number.int({ min: 500, max: 2000 }))); // Random delay
  }

  // // Insert transactions
  const createdTransactions = await db
    .insert(transactions)
    .values(
      Array.from({ length: 100 }, (_, i) => {
        const isTransfer = i >= 70; // Make later transactions transfers (matches our ethscriptions count)
        const data = faker.lorem.paragraph().slice(0, 1000);

        return {
          block_number: faker.helpers.arrayElement(blockNumbers),
          block_blockhash: faker.helpers.arrayElement(blockHashes),
          block_timestamp: faker.number.int({ min: 1_600_000_000, max: 1_700_000_000 }),
          transaction_type: faker.number.int({ min: 0, max: 2 }),
          transaction_hash: transactionHashes[i],
          transaction_index: faker.number.int({ min: 0, max: 1000 }),
          transaction_value: faker.number.int({ min: 0, max: 1_000_000 }),
          transaction_fee: BigInt('1000000000000000'),
          gas_price: '50000000000',
          gas_used: '21000',
          from_address: faker.helpers.arrayElement(addresses),
          to_address: faker.helpers.arrayElement(addresses),
          is_transfer: isTransfer,
          // If transfer, empty data. Otherwise, generate some content
          truncated_data: isTransfer ? '' : data,
          truncated_data_raw: isTransfer ? '0x' : toHex(data).slice(0, 2000),
        };
      }),
    )
    .returning();

  // // Insert ethscriptions (using first 70 transaction hashes)
  const createdEthscriptions = await db
    .insert(ethscriptions)
    .values(
      Array.from({ length: 70 }, (_, i) => ({
        id: transactionHashes[i],
        number: i + 1,
        block_number: faker.helpers.arrayElement(blockNumbers),
        block_timestamp: createdTransactions[i].block_timestamp,
        transaction_index: createdTransactions[i].transaction_index,
        media_type: 'text',
        media_subtype: 'plain',
        content_type: 'text/plain',
        content_sha: faker.string.hexadecimal({ length: 64, prefix: '0x' }),
        is_esip0: faker.datatype.boolean(),
        is_esip3: faker.datatype.boolean(),
        is_esip4: faker.datatype.boolean(),
        is_esip6: faker.datatype.boolean(),
        is_esip8: faker.datatype.boolean(),
        current_owner: createdTransactions[i].to_address,
        previous_owner: createdTransactions[i].from_address,
        creator: createdTransactions[i].from_address,
        initial_owner: createdTransactions[i].to_address,
        // Randomly assign to a collection, intentionally pick between 0 and more than the collections size,
        // so that we can have ones without a collection (eg. empty string)
        collection_id: createdCollections[faker.number.int({ min: 0, max: 50 })]?.id || null,
      })),
    )
    .returning();

  // Insert transfers (using remaining transaction hashes)
  await db.insert(transfers).values(
    Array.from({ length: 25 }, (_, i) => ({
      transaction_hash: transactionHashes[i + 70], // Use later transactions
      ethscription_id: createdEthscriptions[i].id,
      event_log_index: faker.number.int({ min: 0, max: 10 }),
      block_blockhash: faker.helpers.arrayElement(blockHashes),
      block_number: faker.helpers.arrayElement(blockNumbers),
      block_timestamp: faker.number.int({ min: 1_600_000_000, max: 1_700_000_000 }),
      transaction_index: faker.number.int({ min: 0, max: 1000 }),
      from_address: faker.helpers.arrayElement(addresses),
      to_address: faker.helpers.arrayElement(addresses),
    })),
  );

  const voteType = faker.datatype.boolean();
  // Insert random votes
  await db.insert(votes).values(
    // Array.from({ length: 50 }, (_, i) => {
    //   return {
    //     transaction_hash: createdEthscriptions[i].id, // Use later transactions
    //     ethscription_id: createdEthscriptions[i].id,

    //     voted_at: faker.number.int({ min: 1600000000, max: 1700000000 }),
    //     voter: faker.helpers.arrayElement(addresses),
    //     rank: faker.number.int({ min: 0, max: 200 }),
    //     up: voteType,
    //     down: !voteType,
    //   };
    // }).concat(

    [
      {
        id: 'rd0zjer4tv8z8sot6665hdp3vb0p3bkt',
        transaction_hash: createdEthscriptions[0].id,
        ethscription_id: createdEthscriptions[0].id,
        voter: '0xbeb26bbee20ffc42769efaa8ecd84a3ded774d2a',
        voted_at: 1_668_970_692,
        rank: 195,
        up: true,
        down: false,
      },
      {
        id: 'b6hqufqkds1evk8n79e4p1v4zdzcbymg',
        transaction_hash: createdEthscriptions[3].id,
        ethscription_id: createdEthscriptions[3].id,
        voter: '0xaeba1fc12fe4b894c42ce5fa606821d2f4c522cb',
        voted_at: 1_638_563_694,
        rank: 189,
        up: true,
        down: false,
      },
      {
        id: 'hcz9fz48z407yae5606oyxb166hgcgz9',
        transaction_hash: createdEthscriptions[1].id,
        ethscription_id: createdEthscriptions[1].id,
        voter: '0x0f5ecce3b57cecbe57e8f8c0bf54fadfeeb4edbc',
        voted_at: 1_649_749_700,
        rank: 185,
        up: true,
        down: false,
      },
      {
        id: 'yusgy5gy4v376n5sw315vb44oibnvjfl',
        transaction_hash: createdEthscriptions[3].id,
        ethscription_id: createdEthscriptions[3].id,
        voter: '0x0f5ecce3b57cecbe57e8f8c0bf54fadfeeb4edbc',
        voted_at: 1_653_345_757,
        rank: 183,
        up: false,
        down: true,
      },
      // {
      //   id: 'uy2h9sj5r6id22jqf3hl559z8a16u4zm',
      //   transaction_hash: '0xe5ef62d77ded9aac3da5dfb7ac008eb5fc05fcf17367fd01e025d409b6cf6f8d',
      //   ethscription_id: '0xe5ef62d77ded9aac3da5dfb7ac008eb5fc05fcf17367fd01e025d409b6cf6f8d',
      //   voter: '0xd15c069a7cb0dac767ad9d12507e8d2206fccbbf',
      //   voted_at: 1617662290,
      //   rank: 181,
      //   up: false,
      //   down: true,
      // },
      {
        id: 'anvu73xdildltzmv6l69am7uz2gjya49',
        transaction_hash: createdEthscriptions[3].id,
        ethscription_id: createdEthscriptions[3].id,
        voter: '0xf9ee29bbb8a7abbf66cfaefb7e9be375cad3dccf',
        voted_at: 1_679_847_385,
        rank: 175,
        up: true,
        down: false,
      },
      // {
      //   id: 'dza4ahps7xc4m8i3kt0ucb0a6kjfe7jd',
      //   transaction_hash: '0x4516d81bf2fef8cb0b56993fa9bde49faacbd72fbbeb34fca7516a0c1faa7ba3',
      //   ethscription_id: '0x4516d81bf2fef8cb0b56993fa9bde49faacbd72fbbeb34fca7516a0c1faa7ba3',
      //   voter: '0xda05dffbcafdab2f495eb84ccee0a89577cbbbba',
      //   voted_at: 1600364974,
      //   rank: 175,
      //   up: false,
      //   down: true,
      // },
      // {
      //   id: 'hmw5ezdoy9xvomldifw7ep4q5sltkrih',
      //   transaction_hash: '0x6f576a41ea7fa7cb95e9d8e6e73daf0cfa7207b2f0e7ac9deb8e7d0b4afcf940',
      //   ethscription_id: '0x6f576a41ea7fa7cb95e9d8e6e73daf0cfa7207b2f0e7ac9deb8e7d0b4afcf940',
      //   voter: '0xca96e641d7adb5dc9acccedaa4ac9e7ea4ce9b84',
      //   voted_at: 1615891787,
      //   rank: 171,
      //   up: false,
      //   down: true,
      // },
      // {
      //   id: 'nmrdnlj4jo7dlbv3oxkhsv6ng2x7rfkn',
      //   transaction_hash: '0xc5b6ee986e5ef139a8b52dca9b89fc2bf2ade925d7c0ad1ba4dc9ae018d8fdee',
      //   ethscription_id: '0xc5b6ee986e5ef139a8b52dca9b89fc2bf2ade925d7c0ad1ba4dc9ae018d8fdee',
      //   voter: '0xbeb26bbee20ffc42769efaa8ecd84a3ded774d2a',
      //   voted_at: 1615383335,
      //   rank: 170,
      //   up: true,
      //   down: false,
      // },
      // {
      //   id: 'la3htse6wus1mb4gj1578htr40ho5uug',
      //   transaction_hash: '0x965eaba565cf832ee357f392c8b088393d7159e67be81ec97320bdc0a351e43d',
      //   ethscription_id: '0x965eaba565cf832ee357f392c8b088393d7159e67be81ec97320bdc0a351e43d',
      //   voter: '0xcaacf99df3224ad4ff9818ed7cc088e6bf11ba3f',
      //   voted_at: 1601053543,
      //   rank: 167,
      //   up: true,
      //   down: false,
      // },
      // {
      //   id: 'h53fl5p0k9ga48k3bk9k6bvgc38jyb0i',
      //   transaction_hash: '0xbabcb255e5c1ca49adf56b16fcbffa81daeb467fe2a10c2c0f7290e9acd1b35c',
      //   ethscription_id: '0xbabcb255e5c1ca49adf56b16fcbffa81daeb467fe2a10c2c0f7290e9acd1b35c',
      //   voter: '0xd49cae343ec1cc9e43d85ca3f05fbb8baf3c7257',
      //   voted_at: 1646319965,
      //   rank: 166,
      //   up: true,
      //   down: false,
      // },
      // {
      //   id: 'mtnjhe7a5lusy5pdvruit4xlpznwua2c',
      //   transaction_hash: '0x02baf411d6b2aeecc39b7b7132c8caa20ed2bad6eecec7bd2eea36c63e3468dc',
      //   ethscription_id: '0x02baf411d6b2aeecc39b7b7132c8caa20ed2bad6eecec7bd2eea36c63e3468dc',
      //   voter: '0xf5d2ac0059e7e2f1fa9cfc3c1febccc906c0a7bf',
      //   voted_at: 1648139549,
      //   rank: 165,
      //   up: true,
      //   down: false,
      // },
      // {
      //   id: 'gs9rw3h5oehhr87cxn95cs9brxra8umx',
      //   transaction_hash: '0x239c2f9505da894eececd5b5fabb3d5b7aaddbabd9aacc4ed0ce9a7de9d5a54b',
      //   ethscription_id: '0x239c2f9505da894eececd5b5fabb3d5b7aaddbabd9aacc4ed0ce9a7de9d5a54b',
      //   voter: '0xcaacf99df3224ad4ff9818ed7cc088e6bf11ba3f',
      //   voted_at: 1630503844,
      //   rank: 165,
      //   up: true,
      //   down: false,
      // },
      // {
      //   id: 'tg54r5v0z0a696ibscgf7y2y41tkon5i',
      //   transaction_hash: '0x3b6bff09a9b4eb737ae640ebcf4941f3b6d392c788dbebb5103caf67f3bc8efb',
      //   ethscription_id: '0x3b6bff09a9b4eb737ae640ebcf4941f3b6d392c788dbebb5103caf67f3bc8efb',
      //   voter: '0xca96e641d7adb5dc9acccedaa4ac9e7ea4ce9b84',
      //   voted_at: 1646316462,
      //   rank: 157,
      //   up: false,
      //   down: true,
      // },
      // {
      //   id: 'yguhijpxtnezs92sw0hcu2oqeon2khbk',
      //   transaction_hash: '0xdd26fda20f94fffc3b4eb1bdd5a9b1faba2abeebfe83dd6bb4c74a03f3ee4839',
      //   ethscription_id: '0xdd26fda20f94fffc3b4eb1bdd5a9b1faba2abeebfe83dd6bb4c74a03f3ee4839',
      //   voter: '0xf5d2ac0059e7e2f1fa9cfc3c1febccc906c0a7bf',
      //   voted_at: 1608136267,
      //   rank: 151,
      //   up: false,
      //   down: true,
      // },
      // {
      //   id: 'cobc1djlr92pdy3zdetpn30yuorvdw1z',
      //   transaction_hash: '0x15382f41e278cffbad3ede23b3fe450c121c6c5319ea6a1dbfea6b386b373585',
      //   ethscription_id: '0x15382f41e278cffbad3ede23b3fe450c121c6c5319ea6a1dbfea6b386b373585',
      //   voter: '0x12220d4cc7f1f53694cccecc7016bf5d917feade',
      //   voted_at: 1605107630,
      //   rank: 150,
      //   up: false,
      //   down: true,
      // },
      // {
      //   id: 'bgpa7ywbuh3wi9pcybtv0xbu316y3xta',
      //   transaction_hash: '0x302c5cba7f7f9a487a2e43fb9b06efeac6441ec0366fb1a18dc9e72c4d2dd0d0',
      //   ethscription_id: '0x302c5cba7f7f9a487a2e43fb9b06efeac6441ec0366fb1a18dc9e72c4d2dd0d0',
      //   voter: '0xca96e641d7adb5dc9acccedaa4ac9e7ea4ce9b84',
      //   voted_at: 1638985936,
      //   rank: 147,
      //   up: false,
      //   down: true,
      // },
      // {
      //   id: 's39kwxudcp9gw66voo53cds1r4zt8iti',
      //   transaction_hash: '0x6d4c6a70bf57ffb4e6de284fd9dc64ddd02cd41c5c9e4cabe915c89144a8bb02',
      //   ethscription_id: '0x6d4c6a70bf57ffb4e6de284fd9dc64ddd02cd41c5c9e4cabe915c89144a8bb02',
      //   voter: '0x12220d4cc7f1f53694cccecc7016bf5d917feade',
      //   voted_at: 1637380821,
      //   rank: 136,
      //   up: false,
      //   down: true,
      // },
      // {
      //   id: 'halyxltdmjmo5lmt8h299jlsnawtpr24',
      //   transaction_hash: '0x5da7daadb00e2148c749dad06c31be96eadb0b109caa5fa9b685bdf508bde31d',
      //   ethscription_id: '0x5da7daadb00e2148c749dad06c31be96eadb0b109caa5fa9b685bdf508bde31d',
      //   voter: '0xcaacf99df3224ad4ff9818ed7cc088e6bf11ba3f',
      //   voted_at: 1665839792,
      //   rank: 133,
      //   up: false,
      //   down: true,
      // },
      // {
      //   id: 'g46q3exkpl9teojbu3cgdv9ofebdr2p4',
      //   transaction_hash: '0x84e5b2df6aa67fb4e6d1fd224ecafeefac8c6ca5f0b5cfca7d2b9ccf4f99beef',
      //   ethscription_id: '0x84e5b2df6aa67fb4e6d1fd224ecafeefac8c6ca5f0b5cfca7d2b9ccf4f99beef',
      //   voter: '0xe7d4da0bd7032d8fec0acc1fcb9aed485dfc2c53',
      //   voted_at: 1614871713,
      //   rank: 133,
      //   up: true,
      //   down: false,
      // },
      // {
      //   id: 'bo4kxfu8ijci49vqbenog5y69lvu6nu5',
      //   transaction_hash: '0xadabaeddeaa93ca15fe8978c5d71dd6f50bfe878dae4f75eef4abcf9d6bbd968',
      //   ethscription_id: '0xadabaeddeaa93ca15fe8978c5d71dd6f50bfe878dae4f75eef4abcf9d6bbd968',
      //   voter: '0xf5d2ac0059e7e2f1fa9cfc3c1febccc906c0a7bf',
      //   voted_at: 1630983338,
      //   rank: 124,
      //   up: true,
      //   down: false,
      // },
      // {
      //   id: 'xqhzay25bwkr288ezdbnth8eanwd96mf',
      //   transaction_hash: '0xbacf274adfcc67757aee210ffebff6e81cf7bf4baec2aa1daec4dead9f7acc3a',
      //   ethscription_id: '0xbacf274adfcc67757aee210ffebff6e81cf7bf4baec2aa1daec4dead9f7acc3a',
      //   voter: '0xd15c069a7cb0dac767ad9d12507e8d2206fccbbf',
      //   voted_at: 1640806130,
      //   rank: 123,
      //   up: false,
      //   down: true,
      // },
      // {
      //   transaction_hash: '0xdd26fda20f94fffc3b4eb1bdd5a9b1faba2abeebfe83dd6bb4c74a03f3ee4839',
      //   ethscription_id: '0xdd26fda20f94fffc3b4eb1bdd5a9b1faba2abeebfe83dd6bb4c74a03f3ee4839',
      //   voter: '0xf5d2ac0059e7e2f1fa9cfc3c1febccc906c0a7bf',
      //   voted_at: faker.number.int({ min: 1600000000, max: 1700000000 }),
      //   rank: faker.number.int({ min: 0, max: 200 }),
      //   up: voteType,
      //   down: !voteType,
      // },
      // {
      //   transaction_hash: '0xdd26fda20f94fffc3b4eb1bdd5a9b1faba2abeebfe83dd6bb4c74a03f3ee4839',
      //   ethscription_id: '0xdd26fda20f94fffc3b4eb1bdd5a9b1faba2abeebfe83dd6bb4c74a03f3ee4839',
      //   voter: '0x12220d4cc7f1f53694cccecc7016bf5d917feade',
      //   voted_at: faker.number.int({ min: 1600000000, max: 1700000000 }),
      //   rank: faker.number.int({ min: 0, max: 200 }),
      //   up: !voteType,
      //   down: !!voteType,
      // },
      // {
      //   transaction_hash: '0xdd26fda20f94fffc3b4eb1bdd5a9b1faba2abeebfe83dd6bb4c74a03f3ee4839',
      //   ethscription_id: '0xdd26fda20f94fffc3b4eb1bdd5a9b1faba2abeebfe83dd6bb4c74a03f3ee4839',
      //   voter: '0xcaacf99df3224ad4ff9818ed7cc088e6bf11ba3f',
      //   voted_at: faker.number.int({ min: 1600000000, max: 1700000000 }),
      //   rank: faker.number.int({ min: 0, max: 200 }),
      //   up: !!voteType,
      //   down: !!!voteType,
      // },
    ],
  );

  console.log('Seed completed successfully!');
}

main().catch((err) => {
  console.error('Error during seeding:', err);
  process.exit(1);
});
