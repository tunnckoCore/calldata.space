// import { and, asc, desc, eq, gt, gte, like, lt, lte } from 'drizzle-orm';
// NOTE: used for selecting proper operators for the where clause
import * as orm from 'drizzle-orm';

import { db } from '@/db/index.ts';
import { ethscriptions } from '@/db/schema/ethscriptions.ts';
import { ethscriptionParamsSchema } from '@/utils/params-validation.ts';
import { withIncludesExcludes, withValidation } from '@/utils/validation.ts';

// GET /ethscriptions/:id - Get a single collection by ID (ethscriptions.id or ethscriptions.slug)
export const GET = withValidation(
  ethscriptionParamsSchema,
  async (req, { params, searchQuery }) => {
    const segments = await params;
    const searchParams = new URL(req.url).searchParams;
    console.log('the /ethscriptions/:id endpoint', searchQuery, segments);
    const query = db
      .select()
      .from(ethscriptions)
      .where(
        orm.or(
          orm.eq(ethscriptions.id, segments.id as string),
          orm.eq(ethscriptions.number, segments.id as number),
        ),
      );
    let results = await query;

    if (results.length === 0) {
      return {
        status: 404,
        message: 'Ethscription not found',
        error: {
          issues: [
            {
              code: 'not_found',
              message: 'This transaction does not exist, or there is no Ethscription on it.',
              keys: [segments.id],
              path: [],
            },
          ],
        },
      };
    }

    return { data: withIncludesExcludes(results, searchQuery) };
  },
);
