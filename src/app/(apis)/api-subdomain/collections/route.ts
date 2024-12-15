import { NextRequest, NextResponse } from 'next/server';
// NOTE: used for selecting proper operators for the where clause
import * as orm from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db/index.ts';
import { collections, insertCollectionSchema } from '@/db/schema/index.ts';
import { collectionParamsSchema } from '@/utils/params-validation.ts';
import { withIncludesExcludes, withValidation } from '@/utils/validation.ts';

function handleSearchParams(searchQuery, searchParams: URLSearchParams) {
  const conditions: any = [];

  // Text fields - exact match or contains
  for (const field of ['id', 'slug', 'name', 'description', 'logo', 'banner']) {
    if (searchParams.has(field)) {
      let value = searchQuery[field];
      let val = value.includes('*') ? value.replaceAll('*', '%') : value;
      if (field === 'slug') {
        val = val.toLowerCase();
        value = value.toLowerCase();
      }
      conditions.push(
        value.includes('*') ? orm.like(collections[field], val) : orm.eq(collections[field], val),
      );
    }
  }

  // Number field with comparison operators
  if (searchParams.has('supply')) {
    const val = searchQuery.supply;
    const value = (val as any).value ?? val;
    const [op, num] = searchParams.get('supply')?.includes(':') ? [val.op, value] : ['eq', value];

    switch (op) {
      case 'gt': {
        conditions.push(orm.gt(collections.supply, num));
        break;
      }
      case 'lt': {
        conditions.push(orm.lt(collections.supply, num));
        break;
      }
      case 'gte': {
        conditions.push(orm.gte(collections.supply, num));
        break;
      }
      case 'lte': {
        conditions.push(orm.lte(collections.supply, num));
        break;
      }
      case 'range': {
        const { min, max } = val;
        conditions.push(orm.gte(collections.supply, min), orm.lte(collections.supply, max));
        break;
      }
      default: {
        conditions.push(orm.eq(collections.supply, num));
      }
    }
  }

  // Boolean field
  if (searchQuery.verified) {
    conditions.push(orm.eq(collections.verified, searchQuery.verified));
  }

  return conditions;
}

export const GET = withValidation(collectionParamsSchema, async (req, { searchQuery }) => {
  const searchParams = new URL(req.url).searchParams;
  const offset = searchQuery.page_key ? 0 : (searchQuery.page - 1) * searchQuery.page_size;

  const [{ total }] = await db
    .select({ total: orm.sql<number>`COUNT(*) OVER()` })
    .from(collections);

  const query = db
    .select({
      created_at: collections.created_at,
      id: collections.id,
      supply: collections.supply,
      slug: collections.slug,
      name: collections.name,
      description: collections.description,
      logo: collections.logo,
      banner: collections.banner,
      links: collections.links,
      team: collections.team,
      royalties: collections.royalties,
      verified: collections.verified,
    })
    .from(collections);

  const conditions = handleSearchParams(searchQuery, searchParams);

  const isAscending = searchQuery.order === 'asc';
  const order = isAscending ? orm.asc : orm.desc;

  if (searchQuery.page_key) {
    conditions.push((isAscending ? orm.gt : orm.lt)(collections.id, searchQuery.page_key));
  }

  // Apply conditions and ordering, if it's not a `where` query param clause
  // if it is a `where` clause, then we construct the query based on the `where` object
  if (!searchQuery.where && conditions.length > 0) {
    query.where(orm.and(...conditions));
  } else if (searchQuery.where) {
    for (const [key, spec] of Object.entries(searchQuery.where)) {
      for (const [op, value] of Object.entries(spec)) {
        // console.log({ op, key, value, spec });
        const val = value.includes('*') ? value.replaceAll('*', '%') : value;
        query.where(orm[op](collections[key], val));
      }
    }
  }

  query.orderBy(order(collections.id));
  query.limit(searchQuery.page_size);

  if (!searchQuery.page_key) {
    query.offset(offset);
  }

  const results = await query;
  // const results = res.map(({ total, ...row }) => ({ ...row }));
  const left = total - searchQuery.page_size;
  const has_next = total > offset + searchQuery.page_size ? searchQuery.page + 1 : null;
  const nextCursor = has_next ? results.at(-1)?.id : null;

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
          page_size: searchQuery.page_size,
          page_key: nextCursor || null,
          has_more: Boolean(has_next),
        },
    data: withIncludesExcludes(results, searchQuery),
    status: 200,
  };
});

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();

    // Validate the input using our schema
    const validatedData = insertCollectionSchema.parse(body);

    // Insert the collection into the database
    const [newCollection] = await db.insert(collections).values(validatedData).returning();

    // Return the created collection
    return NextResponse.json({ data: newCollection }, { status: 201 });
  } catch (err_: any) {
    // Handle validation errors specifically
    if (err_ instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: 'Request body validation failed',
          status: 400,
          error: err_,
        },
        { status: 400 },
      );
    }

    // Handle any errors
    const msg = err_.toString();
    const err = {
      name: err_.name,
      code: err_.code,
      message: err_.code === 'SQLITE_CONSTRAINT' ? msg.split('SQLITE_CONSTRAINT: ')?.[1] : msg,
    };

    return NextResponse.json(
      { message: 'Fatal server failure', status: 500, error: err },
      { status: 500 },
    );
  }
}
