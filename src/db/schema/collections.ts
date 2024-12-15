import { init as initCuidV2 } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';
import * as sq from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

const createCuidV2 = initCuidV2({ length: 32, fingerprint: crypto.randomUUID() });

export const collections = sq.sqliteTable('collections', {
  id: sq.text().notNull().primaryKey().$defaultFn(createCuidV2),
  supply: sq.integer().notNull(),
  slug: sq.text().notNull().unique(),
  name: sq.text().notNull().unique(),
  description: sq.text().notNull(),
  logo: sq.text().notNull().default('https://example.com/logo.png'),
  banner: sq.text().notNull().default('https://example.com/banner.png'),
  links: sq.text({ mode: 'json' }).notNull().$type<`https://${string}`[]>().default([]),
  team: sq.text({ mode: 'json' }).notNull().$type<(`0x${string}` | string)[]>().default([]),
  royalties: sq
    .text({ mode: 'json' })
    .notNull()
    .$type<{ [key: `0x${string}`]: number }>()
    .default({}),
  verified: sq.integer({ mode: 'boolean' }).notNull().default(false),

  // NOTE: replace with sql`DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))`
  created_at: sq
    .integer()
    .notNull()
    .default(sql`(unixepoch())`),
});

export const selectCollectionSchema = createSelectSchema(collections);
export const insertCollectionSchema = createInsertSchema(collections, {
  supply: z.number().int().positive(),
  slug: z
    .string()
    .min(1)
    .regex(/^[\da-z-]+$/),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  logo: z.string().url(),
  banner: z.string().url(),
  links: z
    .array(
      z
        .string()
        .url()
        .transform((url): `https://${string}` => url as `https://${string}`),
    )
    .default([]),
  team: z.array(z.string().regex(/^(0x[\dA-Fa-f]{40}|.*\.eth)$/)).default([]),
  royalties: z
    .record(z.string().regex(/^(0x[\dA-Fa-f]{40}|.*\.eth)$/), z.number().min(0).max(100))
    .default({}),
  verified: z.boolean().default(false),
});
export type CollectionSelectType = z.infer<typeof selectCollectionSchema>;
export type CollectionInsertType = z.infer<typeof insertCollectionSchema>;

// export const collectionsRelations = relations(collections, ({ one, many }) => ({
//   metadata: one(transactions, {
//     fields: [collections.id],
//     references: [transactions.transaction_hash],
//   }),
//   transfers: many(transfers),
//   votes: many(votes),
// }));
