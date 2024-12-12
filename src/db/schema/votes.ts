import { init as initCuidV2 } from '@paralleldrive/cuid2';
import { relations, sql } from 'drizzle-orm';
import * as sq from 'drizzle-orm/sqlite-core';

// import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
// import { z } from 'zod';

import { ethscriptions, transactions } from './index.ts';

const createCuidV2 = initCuidV2({ length: 32, fingerprint: crypto.randomUUID() });

export const votes = sq.sqliteTable('votes', {
  id: sq.text().primaryKey().$defaultFn(createCuidV2),

  // Both `transaction_hash` and `ethscription_id` are the same,
  // this one is use to link to `metadata` and the `transactions` table
  // cuz weirdly you cannot make to `one-to-one` relations using the same field?!
  transaction_hash: sq
    .text()
    .notNull()
    .references(() => transactions.transaction_hash),

  // And `ethscription_id` is the Ethscription ID that was transferred
  ethscription_id: sq
    .text()
    .notNull()
    .references(() => ethscriptions.id),

  voted_at: sq
    .integer()
    .notNull()
    .default(sql`(unixepoch())`),

  voter: sq.text().notNull(),
  rank: sq.integer().default(0),
  up: sq.integer({ mode: 'boolean' }).notNull(),
  down: sq.integer({ mode: 'boolean' }).notNull(),
});

export const votesRelations = relations(votes, ({ one }) => ({
  metadata: one(transactions, {
    fields: [votes.transaction_hash],
    references: [transactions.transaction_hash],
  }),
  ethscription: one(ethscriptions, {
    fields: [votes.ethscription_id],
    references: [ethscriptions.id],
  }),
}));

// export const selectVoteSchema = createSelectSchema(votes);
// export const insertVoteSchema = createInsertSchema(votes);
// export type VoteSelectType = z.infer<typeof selectVoteSchema>;
// export type VoteInsertType = z.infer<typeof insertVoteSchema>;
