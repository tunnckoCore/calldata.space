// import { and, asc, desc, eq, gt, gte, like, lt, lte } from 'drizzle-orm';
// NOTE: used for selecting proper operators for the where clause
import * as orm from 'drizzle-orm';

import { db } from '@/db/index.ts';
import { votes } from '@/db/schema/index.ts';
import { voteParamsSchema } from '@/utils/params-validation.ts';
import { withIncludesExcludes, withValidation } from '@/utils/validation.ts';

// GET /collections/:id - Get a single collection by ID (collections.id or collections.slug)
export const GET = withValidation(voteParamsSchema, async (req, { params, searchQuery }) => {
  const segments = await params;
  const query = db
    .select()
    .from(votes)
    .where(
      orm.or(
        orm.eq(votes.id, segments.id as string),
        orm.eq(votes.ethscription_id, segments.id as string),
      ),
    );

  let results = await query;

  if (results.length === 0) {
    return {
      status: 404,
      message: 'Vote not found',
      error: {
        issues: [
          {
            code: 'not_found',
            message: 'There is no votes for this ethscription',
            keys: [segments.id],
            path: [],
          },
        ],
      },
    };
  }

  return { data: withIncludesExcludes(results, searchQuery) };
});
