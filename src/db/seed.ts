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


import { toHex } from 'viem';
import { faker } from '@faker-js/faker';
import { db } from './index.ts';
import { transactions, ethscriptions, transfers } from './schema/transactions.ts';

async function main() {
  // First clear all tables (in correct order due to foreign keys)
  await db.delete(transfers);
  await db.delete(ethscriptions);
  await db.delete(transactions);

  // Generate unique values
  const transactionHashes = Array.from({ length: 100 }, () =>
    faker.string.hexadecimal({ length: 64, prefix: '0x' })
  );

  const addresses = Array.from({ length: 20 }, () =>
    faker.string.hexadecimal({ length: 40, prefix: '0x' })
  );

  const blockHashes = Array.from({ length: 30 }, () =>
    faker.string.hexadecimal({ length: 64, prefix: '0x' })
  );
  const blockNumbers = Array.from({ length: 30 }, () =>
    faker.number.int({ min: 1000, max: 5000 })
  );

  // Insert transactions
  const createdTransactions = await db.insert(transactions).values(
    Array.from({ length: 100 }, (_, i) => {
      const isTransfer = i >= 70; // Make later transactions transfers (matches our ethscriptions count)
      const data = faker.lorem.paragraph().slice(0, 1000)

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
    })
  ).returning();

  // Insert ethscriptions (using first 70 transaction hashes)
  const createdEthscriptions = await db.insert(ethscriptions).values(
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
    }))
  ).returning();

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
    }))
  );

  console.log('Seed completed successfully!');
}

main().catch((err) => {
  console.error('Error during seeding:', err);
  process.exit(1);
});
