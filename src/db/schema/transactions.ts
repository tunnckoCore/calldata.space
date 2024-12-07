import * as sq from 'drizzle-orm/sqlite-core';
// import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
// import { z } from 'zod';

export const transactions = sq.sqliteTable('transactions', {
  block_number: sq.integer().notNull(),
  block_blockhash: sq.text().notNull(),
  block_timestamp: sq.integer().notNull(),
  transaction_type: sq.integer().notNull(),
  transaction_hash: sq.text().notNull().primaryKey(), // creation transaction hash, OR transfer transaction hash
  transaction_index: sq.integer().notNull(),
  transaction_value: sq.integer().notNull(),
  transaction_fee: sq.blob({ mode: 'bigint' }).notNull(),
  gas_price: sq.text().notNull(),
  gas_used: sq.text().notNull(),
  from_address: sq.text().notNull(), // creator, OR when transfer it's the previous owner
  to_address: sq.text().notNull(), // initial receiver, OR when transfer it's the new owner

  // if the tx is Ethscription Transfer, this is `true`
  is_transfer: sq.integer({ mode: 'boolean' }).notNull(),

  // NOTE: if the tx is Ethscription Transfer empty "" or "0x", otherwise first 1kb of the input calldata field.
  // No need to actually host the entirety of it, we can decode it on the fly and cache it forever on CDNs and Edge.
  // But we also want to have access to the first 1kb of input calldata for filtering and indexing purposes, like meta protocols
  truncated_data: sq.text().notNull(), // decoded value (no hex); empty if transfer
  truncated_data_raw: sq.text().notNull(), // raw hex value; 0x if transfer
});

// export const selectTransactionSchema = createSelectSchema(transactions);
// export const insertTransactionSchema = createInsertSchema(transactions);
// export type TransactionSelectType = z.infer<typeof selectTransactionSchema>;
// export type TransactionInsertType = z.infer<typeof insertTransactionSchema>;
