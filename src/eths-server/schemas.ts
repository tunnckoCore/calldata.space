import { z } from 'zod';

export const HexSchema = z.custom(
  (x) =>
    x &&
    typeof x === 'string' &&
    x.length > 0 &&
    /^[\da-f]+$/i.test(x.replace('0x', '')) &&
    x.length % 2 === 0,
  { message: 'Expected a valid hex string' },
);

export const DataURISchema = z
  .string()
  .startsWith('data:')
  .or(HexSchema.and(z.string().startsWith('0x646174613a')));

export const UserSchema = HexSchema.and(z.string().length(42)).or(z.string().min(1));
export const HashSchema = HexSchema.and(z.string().length(66));

export const FilterSchema = z.object({
  current_owner: UserSchema.optional(),
  current: UserSchema.optional(),
  initial_owner: UserSchema.optional(),
  initial: UserSchema.optional(),
  previous_owner: UserSchema.optional(),
  previous: UserSchema.optional(),
  owner: UserSchema.optional(),
  creator: UserSchema.optional(),
  receiver: UserSchema.optional(),
  page_key: HashSchema.optional(),
  content_sha: HashSchema.optional(),
  max_results: z.coerce.number().optional(),
  per_page: z.coerce.number().optional(),
  resolve: z.coerce.boolean().or(z.literal(1)).optional(),
  media_type: z
    .union([
      z.literal('image'),
      z.literal('text'),
      z.literal('video'),
      z.literal('audio'),
      z.literal('application'),
    ])
    .optional(),
  media_subtype: z.coerce.string().optional(),
  content_type: z.coerce.string().optional(),
  attachment_present: z.coerce.boolean().optional(),
});
