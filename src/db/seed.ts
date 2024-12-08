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
        slug: name.toLowerCase().replace(/\s/g, '-'),
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
          block_timestamp: faker.number.int({ min: 1600000000, max: 1700000000 }),
          transaction_type: faker.number.int({ min: 0, max: 2 }),
          transaction_hash: transactionHashes[i],
          transaction_index: faker.number.int({ min: 0, max: 1000 }),
          transaction_value: faker.number.int({ min: 0, max: 1000000 }),
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
      block_timestamp: faker.number.int({ min: 1600000000, max: 1700000000 }),
      transaction_index: faker.number.int({ min: 0, max: 1000 }),
      from_address: faker.helpers.arrayElement(addresses),
      to_address: faker.helpers.arrayElement(addresses),
    })),
  );

  // Insert random votes
  await db.insert(votes).values(
    Array.from({ length: 25 }, (_, i) => {
      const voteType = faker.datatype.boolean();

      return {
        transaction_hash: createdEthscriptions[i].id, // Use later transactions
        ethscription_id: createdEthscriptions[i].id,

        timestamp: faker.number.int({ min: 1600000000, max: 1700000000 }),
        voter: faker.helpers.arrayElement(addresses),
        rank: faker.number.int({ min: 0, max: 200 }),
        up: voteType,
        down: !voteType,
      };
    }),
  );

  console.log('Seed completed successfully!');
}

main().catch((err) => {
  console.error('Error during seeding:', err);
  process.exit(1);
});
