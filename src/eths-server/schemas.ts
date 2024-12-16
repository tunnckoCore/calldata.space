import { booleanSchema, numberSchema } from '@/utils/params-validation.ts';
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

export const HashSchema = z
  .string()
  .length(66)
  .regex(/^0x[\dA-Fa-f]{64}$/, {
    message: `Invalid ethscription_id format. Must be a hex string, usually the transaction_hash`,
  });

export const NotHexSchema = z.custom(
  (x) => x && typeof x === 'string' && x.length > 0 && !/^[\da-f]+$/i.test(x.replace('0x', '')),
  { message: 'Expected a not-hex string, received hex' },
);

export const DataURISchema = z
  .string()
  .startsWith('data:')
  .or(HexSchema.and(z.string().startsWith('0x646174613a')));

export const UserSchema = HexSchema.and(z.string().length(42)).or(z.string().min(1));
export const IdSchema = z
  .string()
  .transform((x) => x.replaceAll(',', ''))
  .pipe(
    z
      .string()
      .min(1)
      .max(66)
      .regex(/^([1-9]\d*|0x[\dA-Fa-f]{64})$/, {
        message: `Invalid "id" format. Must be a ethscription number or transaction hash`,
      }),
  );

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
  max_results: numberSchema.optional(),
  per_page: numberSchema.optional(),
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
  attachment_present: booleanSchema.optional(),
});
