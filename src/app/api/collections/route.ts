import { NextRequest, NextResponse } from 'next/server';
import { and, asc, desc, eq, gt, gte, like, lt, lte, sql } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { collections, insertCollectionSchema } from '@/db/schema';
import { collectionParamsSchema } from '@/utils/params-validation';
import { withValidation } from '@/utils/validation';

export const GET = withValidation(collectionParamsSchema, async (req, params) => {
  const searchParams = new URL(req.url).searchParams;
  const offset = params.page_key ? 0 : (params.page - 1) * params.page_size;

  const collectionColumns = {
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
  };

  const query = db
    .select({
      ...collectionColumns,
      total: sql<number>`COUNT(*) OVER()`,
    })
    .from(collections);
  const conditions: any = [];

  // Text fields - exact match or contains
  ['id', 'slug', 'name', 'description', 'logo', 'banner'].forEach((field) => {
    if (searchParams.has(field)) {
      const value = searchParams.get(field)!;
      const val = value.includes('*') ? value.replace(/\*/g, '') : value;
      conditions.push(
        value.includes('*') ? like(collections[field], `%${val}%`) : eq(collections[field], value),
      );
    }
  });

  // Number field with comparison operators
  if (searchParams.has('supply')) {
    const value = searchParams.get('supply')!;
    const [op, num] = value.split(':');

    switch (op) {
      case 'gt':
        conditions.push(gt(collections.supply, parseInt(num)));
        break;
      case 'lt':
        conditions.push(lt(collections.supply, parseInt(num)));
        break;
      case 'gte':
        conditions.push(gte(collections.supply, parseInt(num)));
        break;
      case 'lte':
        conditions.push(lte(collections.supply, parseInt(num)));
        break;
      case 'range':
        const [min, max] = num.split(',');
        conditions.push(
          gte(collections.supply, parseInt(min)),
          lte(collections.supply, parseInt(max)),
        );
        break;
      default:
        conditions.push(eq(collections.supply, parseInt(value)));
    }
  }

  // Boolean field
  if (searchParams.has('verified')) {
    conditions.push(eq(collections.verified, searchParams.get('verified') === 'true'));
  }

  // Array fields (links, team)
  ['links', 'team'].forEach((field) => {
    if (searchParams.has(field)) {
      const value = searchParams.get(field)!;
      conditions.push(like(collections[field], `%${value}%`));
    }
  });

  const isAscending = params.order === 'asc';
  const order = isAscending ? asc : desc;

  if (params.page_key) {
    conditions.push((isAscending ? gt : lt)(collections.created_at, params.page_key));
  }

  // Apply conditions and ordering
  if (conditions.length) {
    query.where(and(...conditions));
  }

  query.orderBy(order(collections.created_at));
  query.limit(params.page_size);

  if (!Boolean(params.page_key)) {
    query.offset(offset);
  }

  const res = await query;
  const results = res.map(({ total, ...row }) => ({ ...row }));
  const total = res[0]?.total ?? 0;
  const isPageKey = searchParams.has('page_key');
  const left = total - params.page_size;
  const has_next = total > offset + params.page_size ? params.page + 1 : null;
  const nextCursor = has_next ? res[res.length - 1]?.created_at : null;

  return {
    pagination: params.page_key
      ? {
          total,
          items_left: left < 0 ? 0 : left,
          page_size: params.page_size,
          [isPageKey ? 'page_key' : 'cursor']: nextCursor || null,
          has_more: left > 0,
        }
      : {
          total,
          page_size: params.page_size,
          pages: Math.ceil(total / params.page_size),
          page: params.page,
          prev: params.page > 1 ? params.page - 1 : null,
          next: has_next,
          [isPageKey ? 'page_key' : 'cursor']: nextCursor || null,
          has_more: Boolean(has_next),
        },
    data: results,
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
  } catch (error: any) {
    // Handle validation errors specifically
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: 'Request body validation failed',
          status: 400,
          error,
        },
        { status: 400 },
      );
    }

    // Handle any errors
    const msg = error.toString();
    const err = {
      name: error.name,
      code: error.code,
      message: error.code === 'SQLITE_CONSTRAINT' ? msg.split('SQLITE_CONSTRAINT: ')?.[1] : msg,
    };

    return NextResponse.json(
      { message: 'Fatal server failure', status: 500, error: err },
      { status: 500 },
    );
  }
}
