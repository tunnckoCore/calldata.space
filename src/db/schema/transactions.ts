// import { init as initCuidV2 } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import * as sq from 'drizzle-orm/sqlite-core';

// import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// const createCuidV2 = initCuidV2({ length: 14, fingerprint: crypto.randomUUID() });

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

// const selectTransactionSchema = createSelectSchema(transactions);
// const insertTransactionSchema = createInsertSchema(transactions);
// type TransactionSelectType = z.infer<typeof selectTransactionSchema>;
// type TransactionInsertType = z.infer<typeof insertTransactionSchema>;

export const ethscriptions = sq.sqliteTable('ethscriptions', {
  id: sq
    .text()
    .notNull()
    .primaryKey()
    .references(() => transactions.transaction_hash, { onDelete: 'cascade' }),
  number: sq.integer(), // Ethscription number in sequence

  block_number: sq.integer().notNull(),
  block_timestamp: sq.integer().notNull(),
  transaction_index: sq.integer().notNull(),
  media_type: sq.text().notNull(),
  media_subtype: sq.text().notNull(),
  content_type: sq.text().notNull(),
  content_sha: sq.text().notNull(),

  is_esip0: sq.integer({ mode: 'boolean' }).notNull(),
  is_esip3: sq.integer({ mode: 'boolean' }).notNull(),
  is_esip4: sq.integer({ mode: 'boolean' }).notNull(),
  is_esip6: sq.integer({ mode: 'boolean' }).notNull(),
  is_esip8: sq.integer({ mode: 'boolean' }).notNull(),

  current_owner: sq.text().notNull(),
  previous_owner: sq.text().notNull(),
  creator: sq.text().notNull(),
  initial_owner: sq.text().notNull(),
});

export const ethscriptionsRelations = relations(ethscriptions, ({ one, many }) => ({
  metadata: one(transactions, {
    fields: [ethscriptions.id],
    references: [transactions.transaction_hash],
  }),
  transfers: many(transfers),
}));

// export const selectEthscriptionSchema = createSelectSchema(ethscriptions);
// export const insertEthscriptionSchema = createInsertSchema(ethscriptions);
// export type EthscriptionSelectType = z.infer<typeof selectEthscriptionSchema>;
// export type EthscriptionInsertType = z.infer<typeof insertEthscriptionSchema>;

export const transfers = sq.sqliteTable('transfers', {
  // Transfer `transaction_hash` is the hash of the transaction that initiated the transfer
  transaction_hash: sq
    .text()
    .notNull()
    .references(() => transactions.transaction_hash, { onDelete: 'cascade' }),

  // And `ethscription_id` is the Ethscription ID that was transferred
  ethscription_id: sq
    .text()
    .notNull()
    .references(() => ethscriptions.id, { onDelete: 'cascade' }),

  index: sq.integer().primaryKey({ autoIncrement: true }),
  event_log_index: sq.integer(),

  block_blockhash: sq.text().notNull(),
  block_number: sq.integer().notNull(),
  block_timestamp: sq.integer().notNull(),
  transaction_index: sq.integer().notNull(),

  from_address: sq.text().notNull(),
  to_address: sq.text().notNull(),
});

export const transfersRelations = relations(transfers, ({ one }) => ({
  metadata: one(transactions, {
    fields: [transfers.transaction_hash],
    references: [transactions.transaction_hash],
  }),
  ethscription: one(ethscriptions, {
    fields: [transfers.ethscription_id],
    references: [ethscriptions.id],
  }),
}));

// export const selectTransferSchema = createSelectSchema(transfers);
// export const insertTransferSchema = createInsertSchema(transfers);
// export type TransferSelectType = z.infer<typeof selectTransferSchema>;
// export type TransferInsertType = z.infer<typeof insertTransferSchema>;
