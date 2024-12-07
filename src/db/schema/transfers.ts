import { relations } from 'drizzle-orm';
import * as sq from 'drizzle-orm/sqlite-core';
// import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
// import { z } from 'zod';

import { ethscriptions, transactions } from './index.ts';

export const transfers = sq.sqliteTable('transfers', {
  // Transfer `transaction_hash` is the hash of the transaction that initiated the transfer
  transaction_hash: sq
    .text()
    .notNull()
    .references(() => transactions.transaction_hash),

  // And `ethscription_id` is the Ethscription ID that was transferred
  ethscription_id: sq
    .text()
    .notNull()
    .references(() => ethscriptions.id),

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
