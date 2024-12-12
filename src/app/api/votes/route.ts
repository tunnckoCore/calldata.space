// NOTE: used for selecting proper operators for the where clause
import * as orm from 'drizzle-orm';

// NOTE: used for selecting proper operators for the where clause

import { db } from '@/db';
import { votes } from '@/db/schema';
import { voteParamsSchema } from '@/utils/params-validation';
import { withIncludesExcludes, withValidation } from '@/utils/validation';

// page_size=5&sort_by=rank&order=desc - default sort by rank & vote time, order by desc
// page_size=5&sort_by=voted_at - sort by vote time, order by desc
// page_size=5&sort_by=voted_at&order=asc - sort by vote time and rank, order by asc

// GET /api/votes - get all votes including filters and withIncludesExcludes
export const GET = withValidation(voteParamsSchema, async (req, { searchQuery }) => {
  const searchParams = new URL(req.url).searchParams;
  const offset = searchQuery.page_key ? 0 : (searchQuery.page - 1) * searchQuery.page_size;

  const query = db
    .select({
      id: votes.id,
      // transaction_hash: votes.transaction_hash,
      ethscription_id: votes.ethscription_id,
      voter: votes.voter,
      voted_at: votes.voted_at,
      rank: votes.rank,
      up: votes.up,
      down: votes.down,
    })
    .from(votes);

  const conditions: any = [];

  // Text fields - exact match or contains
  ['transaction_hash', 'ethscription_id', 'voter'].forEach((field) => {
    if (searchParams.has(field)) {
      let value = searchQuery[field];
      let val = value.includes('*') ? value.replace(/\*/g, '%') : value;

      conditions.push(
        value.includes('*') ? orm.like(votes[field], val) : orm.eq(votes[field], val),
      );
    }
  });

  // Number-based filters with comparison operators
  ['voted_at', 'rank'].forEach((field) => {
    if (searchParams.has(field)) {
      const val = searchQuery[field];
      const value = (val as any).value ?? val;
      const [op, num] = searchParams.get(field)?.includes(':') ? [val.op, value] : ['eq', value];

      switch (op) {
        case 'gt':
          conditions.push(orm.gt(votes[field], num));
          break;
        case 'lt':
          conditions.push(orm.lt(votes[field], num));
          break;
        case 'gte':
          conditions.push(orm.gte(votes[field], num));
          break;
        case 'lte':
          conditions.push(orm.lte(votes[field], num));
          break;
        case 'range':
          const { min, max } = val;
          conditions.push(orm.gte(votes[field], min), orm.lte(votes[field], max));
          break;
        default:
          conditions.push(orm.eq(votes[field], num));
      }
    }
  });

  // Boolean ESIP filters
  ['up', 'down'].forEach((field) => {
    if (searchParams.has(field)) {
      conditions.push(orm.eq(votes[field], searchQuery[field]));
    }
  });

  const isAscending = searchQuery.order === 'asc';
  const order = isAscending ? orm.asc : orm.desc;

  // !FIXED! LOVELY!
  if (searchQuery.page_key) {
    // Parse the composite cursor
    let [rankNumber, timeVoted] = searchQuery.page_key?.split('_');
    let cond;

    if (searchQuery.sort_by === 'rank') {
      cond = isAscending
        ? orm.sql`(${votes.rank}, ${votes.voted_at}) > (${rankNumber}, ${timeVoted})`
        : orm.sql`(${votes.rank}, ${votes.voted_at}) < (${rankNumber}, ${timeVoted})`;
    } else {
      [timeVoted, rankNumber] = [rankNumber, timeVoted];

      cond = isAscending
        ? orm.sql`(${votes.voted_at}, ${votes.rank}) > (${timeVoted}, ${rankNumber})`
        : orm.sql`(${votes.voted_at}, ${votes.rank}) < (${timeVoted}, ${rankNumber})`;
    }
    conditions.push(cond);
  }

  // Apply conditions and ordering, if it's not a `where` query param clause
  // if it is a `where` clause, then we construct the query based on the `where` object
  if (!searchQuery.where && conditions.length) {
    query.where(orm.and(...conditions));
  } else if (searchQuery.where) {
    for (const [key, spec] of Object.entries(searchQuery.where)) {
      for (const [op, value] of Object.entries(spec)) {
        // console.log({ op, key, value, spec });
        const val = value.includes('*') ? value.replace(/\*/g, '%') : value;
        query.where(orm[op](votes[key], val));
      }
    }
  }

  // !FIXED! LOVELY!
  if (searchQuery.sort_by === 'rank') {
    query.orderBy(order(votes.rank), order(votes.voted_at));
  } else {
    query.orderBy(order(votes.voted_at), order(votes.rank));
  }

  query.limit(searchQuery.page_size);

  if (!Boolean(searchQuery.page_key)) {
    query.offset(offset);
  }

  const res = await query;
  const results = res;

  const [{ total }] = await db.select({ total: orm.sql<number>`COUNT(*) OVER()` }).from(votes);
  const left = total - searchQuery.page_size;
  const has_next = total > offset + searchQuery.page_size ? searchQuery.page + 1 : null;
  // const nextCursor = has_next ? res[res.length - 1]?.id : null;
  let nextCursor;

  if (searchQuery.sort_by === 'rank') {
    nextCursor = has_next
      ? `${results[results.length - 1]?.rank}_${results[results.length - 1]?.voted_at}`
      : null;
  } else {
    nextCursor = has_next
      ? `${results[results.length - 1]?.voted_at}_${results[results.length - 1]?.rank}`
      : null;
  }

  return {
    pagination: searchQuery.page_key
      ? {
          total,
          page_size: searchQuery.page_size,
          page_key: nextCursor || null,
          has_more: left > 0,
        }
      : {
          total,
          pages: Math.ceil(total / searchQuery.page_size),
          page: searchQuery.page,
          prev: searchQuery.page > 1 ? searchQuery.page - 1 : null,
          next: has_next,
          page_size: results.length > 0 ? results.length : 0,
          page_key: nextCursor || null,
          has_more: Boolean(has_next),
        },
    data: withIncludesExcludes(results, searchQuery),
    status: 200,
  };
});
