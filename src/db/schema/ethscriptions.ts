import { relations, sql } from 'drizzle-orm';
import * as sq from 'drizzle-orm/sqlite-core';

// import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
// import { z } from 'zod';

import { collections, transactions, transfers, votes } from './index.ts';

export const ethscriptions = sq.sqliteTable('ethscriptions', {
  id: sq
    .text()
    .notNull()
    .primaryKey()
    .references(() => transactions.transaction_hash),
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

  creator: sq.text().notNull(),
  initial_owner: sq.text().notNull(),
  current_owner: sq.text().notNull(),
  previous_owner: sq.text().notNull(),

  updated_at: sq
    .integer()
    .notNull()
    .default(sql`(unixepoch())`),

  collection_id: sq.text().references(() => collections.id),
});

// export const selectEthscriptionSchema = createSelectSchema(ethscriptions);
// export const insertEthscriptionSchema = createInsertSchema(ethscriptions);
// export type EthscriptionSelectType = z.infer<typeof selectEthscriptionSchema>;
// export type EthscriptionInsertType = z.infer<typeof insertEthscriptionSchema>;

export const ethscriptionsRelations = relations(ethscriptions, ({ one, many }) => ({
  metadata: one(transactions, {
    fields: [ethscriptions.id],
    references: [transactions.transaction_hash],
  }),
  collection: one(collections, {
    fields: [ethscriptions.collection_id],
    references: [collections.id],
  }),
  transfers: many(transfers),
  votes: many(votes),
}));
