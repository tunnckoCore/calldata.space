// import { and, asc, desc, eq, gt, gte, like, lt, lte } from 'drizzle-orm';
// NOTE: used for selecting proper operators for the where clause
import * as orm from 'drizzle-orm';

import { db } from '@/db/index.ts';
import { collections } from '@/db/schema/collections.ts';
import { collectionParamsSchema } from '@/utils/params-validation.ts';
import { withIncludesExcludes, withValidation } from '@/utils/validation.ts';

// GET /collections/:id - Get a single collection by ID (collections.id or collections.slug)
export const GET = withValidation(collectionParamsSchema, async (_req, { params, searchQuery }) => {
  const segments = await params;
  const query = db
    .select()
    .from(collections)
    .where(
      orm.or(
        orm.eq(collections.id, segments.id as string),
        orm.eq(collections.slug, segments.id as string),
      ),
    );

  const results = await query;

  if (results.length === 0) {
    return {
      status: 404,
      message: 'Collection not found',
      error: {
        issues: [
          {
            code: 'not_found',
            message: 'This collection does not exist',
            keys: [segments.id],
            path: [],
          },
        ],
      },
    };
  }

  return { data: withIncludesExcludes(results, searchQuery) };
});
