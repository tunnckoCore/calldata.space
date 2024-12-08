import { z } from 'zod';

// Helper function to create a comparison parameter schema
const createComparisonSchema = (baseSchema: z.ZodSchema) => {
  return z
    .union([
      baseSchema,
      z
        .string()
        .regex(/^gt:\d+$/)
        .transform((s) => ({ op: 'gt', value: parseInt(s.split(':')[1]) })),
      z
        .string()
        .regex(/^lt:\d+$/)
        .transform((s) => ({ op: 'lt', value: parseInt(s.split(':')[1]) })),
      z
        .string()
        .regex(/^gte:\d+$/)
        .transform((s) => ({ op: 'gte', value: parseInt(s.split(':')[1]) })),
      z
        .string()
        .regex(/^lte:\d+$/)
        .transform((s) => ({ op: 'lte', value: parseInt(s.split(':')[1]) })),
      z
        .string()
        .regex(/^range:\d+,\d+$/)
        .transform((s) => {
          const [min, max] = s.split(':')[1].split(',').map(Number);
          return { op: 'range', min, max };
        }),
    ])
    .optional();
};

// Helper for address-like strings (0x... or ENS)
const addressSchema = z.string().regex(/^(0x[a-fA-F0-9]{40}|.*\.eth)$/);

// Helper for wildcard text search
const createWildcardSchema = (schema: z.ZodSchema) => {
  return z
    .union([
      schema,
      z.string().includes('*'),
      // .transform((s) => ({ wildcard: true, value: s.replace(/\*/g, '') })),
    ])
    .optional();
};

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
  // .string()
  // .transform((s) => s.split('_').filter(Number))
  // .pipe(z.array(z.number().int().positive()))
  // .optional(),
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
      .regex(/^0x[a-fA-F0-9]{64}$/, {
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
        z.string().regex(/0x[a-fA-F0-9]{64,}/, {
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

const Operators = ['eq', 'gt', 'lt', 'gte', 'lte', 'like'] as const;
type Operator = (typeof Operators)[number];

const whereOperatorSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
  z.record(z.enum(Operators), valueSchema);

export const ethscriptionParamsSchema = baseEthscriptionSchema;
// export const ethscriptionParamsSchema = baseEthscriptionSchema.extend({
//   where: z.record(
//     z.enum(Object.keys(baseEthscriptionSchema.shape) as [string, ...string[]]),
//     whereOperatorSchema(z.any())
//   ).optional(),
// });

// Export the final type
// export type EthscriptionParams = z.infer<typeof baseEthscriptionSchema> & {
//   where?: WhereClauseType<z.infer<typeof baseEthscriptionSchema>>;
// };

// Then create the where operator schema type
// const whereOperatorSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
//   z.record(
//     z.enum(['eq', 'gt', 'lt', 'gte', 'lte', 'like']),
//     valueSchema
//   );

// Create the complete schema with where clause using z.lazy()
// export const ethscriptionParamsSchema = z.lazy(() =>
//   baseEthscriptionSchema.extend({
//     where: z.record(
//       // Keys are the same as the base schema
//       z.enum(Object.keys(baseEthscriptionSchema.shape) as [string, ...string[]]),
//       // Values are operator objects with corresponding value types
//       whereOperatorSchema(z.any())
//     ).optional()
//   })
// );

// const ethsKeys = Object.keys(baseEthscriptionSchema.shape);
// export const ethscriptionParamsSchema = z.lazy(() => baseEthscriptionSchema.extend({
//   where: z.record(
//     // Keys are the same as the base schema
//     z.enum(ethsKeys as [string, ...string[]]),
//     // Values are operator objects with corresponding value types
//     whereOperatorSchema(z.any())
//   ).optional()
// }));

export const collectionParamsSchema = z
  .object({
    // Pagination
    page: z.coerce.number().int().positive().min(1).default(1),
    page_key: z.number().int().positive().optional(), // timestamp in ms
    page_size: z.coerce.number().int().positive().min(1).max(100).default(25),

    // Sorting
    order: z.enum(['asc', 'desc']).optional(),

    // Text filters
    id: createWildcardSchema(z.string()),
    slug: createWildcardSchema(z.string().regex(/^[a-z0-9-]+$/i)),
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
