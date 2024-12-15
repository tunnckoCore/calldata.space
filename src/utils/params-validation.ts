import { z } from 'zod';

export function createComparisonSchema(baseSchema: z.ZodSchema) {
  return z
    .union([
      baseSchema,
      z
        .string()
        .regex(/^gt:\d+$/)
        .transform((s) => ({ op: 'gt', value: Number.parseInt(s.split(':')[1], 10) })),
      z
        .string()
        .regex(/^lt:\d+$/)
        .transform((s) => ({ op: 'lt', value: Number.parseInt(s.split(':')[1], 10) })),
      z
        .string()
        .regex(/^gte:\d+$/)
        .transform((s) => ({ op: 'gte', value: Number.parseInt(s.split(':')[1], 10) })),
      z
        .string()
        .regex(/^lte:\d+$/)
        .transform((s) => ({ op: 'lte', value: Number.parseInt(s.split(':')[1], 10) })),
      z
        .string()
        .regex(/^range:\d+,\d+$/)
        .transform((s) => {
          const [min, max] = s.split(':')[1].split(',').map(Number);
          return { op: 'range', min, max };
        }),
    ])
    .optional();
}

// Helper for address-like strings (0x... or ENS)
export const addressSchema = z.string().regex(/^(0x[\dA-Fa-f]{40}|.*\.eth)$/);

// Helper for wildcard text search
export function createWildcardSchema(schema: z.ZodSchema) {
  return z
    .union([
      schema,
      z.string().includes('*'),
      // .transform((s) => ({ wildcard: true, value: s.replace(/\*/g, '') })),
    ])
    .optional();
}

export const numberSchema = z.string().transform(Number).pipe(z.number().int().positive());

export const baseEthscriptionSchema = z.object({
  // Pagination
  page: z.coerce.number().int().positive().min(1).default(1),
  page_key: z
    .string()
    .regex(/^\d+_\d+$/, {
      message:
        'Invalid page key format. Must be a string in the format "{block_number}_{transaction_index}", like "123_4"',
    })
    .optional(),
  page_size: z.coerce.number().int().positive().min(1).max(100).default(25),

  // Sorting
  order: z.enum(['asc', 'desc']).optional(),

  // Expansion
  expand: z
    .string()
    .transform((s) => s.split(',').filter(Boolean))
    .pipe(z.array(z.enum(['collection', 'metadata', 'transfers', 'votes'])))
    .optional(),

  // Field filtering
  include: z.string().optional(),
  exclude: z.string().optional(),

  // Numeric filters
  number: createComparisonSchema(numberSchema.default('1')),
  block_number: createComparisonSchema(numberSchema.default('1')),
  block_timestamp: createComparisonSchema(numberSchema.default('1')),
  transaction_index: createComparisonSchema(numberSchema.default('1')),
  updated_at: createComparisonSchema(numberSchema.default('1')),

  // Text filters with wildcard support, hex strings
  id: createWildcardSchema(
    z
      .string()
      .length(66)
      .regex(/^0x[\dA-Fa-f]{64}$/, {
        message: 'Invalid ID format. Must be a hex string, usually the transaction_hash',
      }),
  ),
  media_type: createWildcardSchema(z.string().min(1)),
  media_subtype: createWildcardSchema(z.string().min(1)),
  content_type: createWildcardSchema(
    z
      .string()
      .min(3)
      .regex(/^[a-z]+\/.+$/i, {
        message:
          'Invalid content type format. Must be a string in the format "{type}/{subtype}", like "image/png"',
      }),
  ),
  content_sha: createWildcardSchema(
    z
      .string()
      .min(64)
      .max(66)
      .transform((x) => (x.startsWith('0x') ? x : `0x${x}`))
      .pipe(
        z.string().regex(/0x[\dA-Fa-f]{64,}/, {
          message: 'Invalid content SHA format. Must be a hex string of 32 bytes (64 characters)',
        }),
      ),
  ),

  // Address filters
  creator: createWildcardSchema(addressSchema),
  initial_owner: createWildcardSchema(addressSchema),
  current_owner: createWildcardSchema(addressSchema),
  previous_owner: createWildcardSchema(addressSchema),

  // Collection ID filter
  collection_id: z
    .union([
      z.literal('true'),
      z.literal('false'),
      z.literal('null'),
      createWildcardSchema(z.string()),
    ])
    .optional(),

  // Boolean filters
  is_esip0: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  is_esip3: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  is_esip4: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  is_esip6: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  is_esip8: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

export const ethscriptionParamsSchema = baseEthscriptionSchema;
export const collectionParamsSchema = z
  .object({
    // Pagination
    page: z.coerce.number().int().positive().min(1).default(1),
    page_key: z.string().optional(), // 32-byte long CUIDv2, they are unique and sequential
    page_size: z.coerce.number().int().positive().min(1).max(100).default(25),

    // Sorting
    order: z.enum(['asc', 'desc']).optional(),

    // Text filters
    id: createWildcardSchema(z.string()),
    slug: createWildcardSchema(z.string().regex(/^[\da-z-]+$/i)),
    name: createWildcardSchema(z.string()),
    description: createWildcardSchema(z.string()),
    logo: createWildcardSchema(z.string().url()),
    banner: createWildcardSchema(z.string().url()),

    // Numeric filters
    supply: createComparisonSchema(numberSchema.default('1')),

    // Boolean filters
    verified: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),

    // Array filters
    links: z.array(z.string().url()).optional(),
    team: z.array(z.string()).optional(),

    include: z.string().optional(),
    exclude: z.string().optional(),
  })
  .strict();

export type EthscriptionParams = z.infer<typeof ethscriptionParamsSchema>;
export type CollectionParams = z.infer<typeof collectionParamsSchema>;

export const voteParamsSchema = z.object({
  // Pagination
  page: z.coerce.number().int().positive().min(1).default(1),
  page_key: z.string().optional(), // 32-byte long CUIDv2, they are unique and sequential
  page_size: z.coerce.number().int().positive().min(1).max(100).default(25),

  // Sorting
  order: z.enum(['asc', 'desc']).default('desc'),
  sort_by: z.enum(['voted_at', 'rank']).default('rank'),

  transaction_hash: createWildcardSchema(
    z
      .string()
      .length(66)
      .regex(/^0x[\dA-Fa-f]{64}$/, {
        message: `Invalid transaction_hash format. Must be a hex string`,
      }),
  ),
  ethscription_id: createWildcardSchema(
    z
      .string()
      .length(66)
      .regex(/^0x[\dA-Fa-f]{64}$/, {
        message: `Invalid ethscription_id format. Must be a hex string, usually the transaction_hash`,
      }),
  ),
  voter: createWildcardSchema(addressSchema),

  // numeric filters
  voted_at: createComparisonSchema(numberSchema),
  rank: createComparisonSchema(numberSchema.default('0')),

  // Boolean filters
  up: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  down: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),

  include: z.string().optional(),
  exclude: z.string().optional(),
});

export type VoteParams = z.infer<typeof voteParamsSchema>;
