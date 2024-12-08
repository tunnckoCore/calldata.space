import { NextRequest, NextResponse } from 'next/server';
import { and, asc, desc, eq, gt, gte, like, lt, lte, sql } from 'drizzle-orm';
// NOTE: used for selecting proper operators for the where clause
import * as orm from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import { collections, insertCollectionSchema } from '@/db/schema';
import { collectionParamsSchema } from '@/utils/params-validation';
import { withValidation } from '@/utils/validation';

export const GET = withValidation(collectionParamsSchema, async (req, { searchQuery }) => {
  const searchParams = new URL(req.url).searchParams;
  const offset = searchQuery.page_key ? 0 : (searchQuery.page - 1) * searchQuery.page_size;

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

  // console.log('searchQuery.where in route:', searchQuery.where);

  // Text fields - exact match or contains
  ['id', 'slug', 'name', 'description', 'logo', 'banner'].forEach((field) => {
    if (searchParams.has(field)) {
      let value = searchQuery[field];
      let val = value.includes('*') ? value.replace(/\*/g, '%') : value;
      if (field === 'slug') {
        val = val.toLowerCase();
        value = value.toLowerCase();
      }
      conditions.push(
        value.includes('*') ? like(collections[field], val) : eq(collections[field], val),
      );
    }
    // if (searchParams.has(field)) {
    //   const value = searchParams.get(field)!;
    //   const val = value.includes('*') ? value.replace(/\*/g, '') : value;
    //   conditions.push(
    //     value.includes('*') ? like(collections[field], `%${val}%`) : eq(collections[field], value),
    //   );
    // }
  });

  // Number field with comparison operators
  if (searchParams.has('supply')) {
    const val = searchQuery.supply;
    const value = (val as any).value ?? val;
    const [op, num] = searchParams.get('supply')?.includes(':') ? [val.op, value] : ['eq', value];

    switch (op) {
      case 'gt':
        conditions.push(gt(collections.supply, num));
        break;
      case 'lt':
        conditions.push(lt(collections.supply, num));
        break;
      case 'gte':
        conditions.push(gte(collections.supply, num));
        break;
      case 'lte':
        conditions.push(lte(collections.supply, num));
        break;
      case 'range':
        const { min, max } = val;
        conditions.push(gte(collections.supply, min), lte(collections.supply, max));
        break;
      default:
        conditions.push(eq(collections.supply, num));
    }
  }

  // Boolean field
  if (searchQuery.verified) {
    conditions.push(eq(collections.verified, searchQuery.verified));
  }

  // NOTE: Not needed for filtering probably.
  // Array fields (links, team)
  // ['links', 'team'].forEach((field) => {
  //   if (searchParams.has(field)) {
  //     const value = searchQuery[field];
  //     conditions.push(like(collections[field], `%${value}%`));
  //   }
  // });

  const isAscending = searchQuery.order === 'asc';
  const order = isAscending ? asc : desc;

  if (searchQuery.page_key) {
    conditions.push((isAscending ? gt : lt)(collections.created_at, searchQuery.page_key));
  }

  // Apply conditions and ordering, if it's not a `where` query param clause
  // if it is a `where` clause, then we construct the query based on the `where` object
  if (!searchQuery.where && conditions.length) {
    query.where(and(...conditions));
  } else if (searchQuery.where) {
    // NOTE: the autocompletion for `searchQuery.where.block_number.gt` works,
    // but the type of `searchQuery.where` on hover is not inferred correctly (it's `searchQuery.where: ZodSchema`
    // instead of `searchQuery.where: Record<Operators, any>`)
    for (const [key, spec] of Object.entries(searchQuery.where)) {
      for (const [op, value] of Object.entries(spec)) {
        // console.log({ op, key, value, spec });
        const val = value.includes('*') ? value.replace(/\*/g, '%') : value;
        query.where(orm[op](collections[key], val));
      }
    }
  }

  query.orderBy(order(collections.created_at));
  query.limit(searchQuery.page_size);

  if (!Boolean(searchQuery.page_key)) {
    query.offset(offset);
  }

  const res = await query;
  let results = res.map(({ total, ...row }) => ({ ...row }));
  const total = res[0]?.total ?? 0;
  const left = total - searchQuery.page_size;
  const has_next = total > offset + searchQuery.page_size ? searchQuery.page + 1 : null;
  const nextCursor = has_next ? res[res.length - 1]?.created_at : null;

  const include = searchQuery.include?.split(',').filter(Boolean);
  const exclude = searchQuery.exclude?.split(',').filter(Boolean);

  if (include || exclude) {
    results = results.map((item: any): any => {
      const processObject = (obj: any, prefix = ''): any => {
        if (!obj || typeof obj !== 'object') return obj;

        const result: Record<string, any> = {};
        Object.entries(obj).forEach(([key, value]) => {
          const fullPath = prefix ? `${prefix}.${key}` : key;
          let shouldInclude = true;

          if (exclude) {
            // Check if field or its parent should be excluded
            const isExcluded = exclude.some((pattern) => {
              if (pattern.includes('*')) {
                const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*');
                const regex = new RegExp(`^${regexPattern}$`);
                return regex.test(fullPath);
              }
              return fullPath === pattern || pattern === `${fullPath}.*`;
            });
            shouldInclude = !isExcluded;
          }

          if (include) {
            // Include can override exclude for specific fields
            const isIncluded = include.some((pattern) => {
              if (pattern.includes('*')) {
                const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*');
                const regex = new RegExp(`^${regexPattern}$`);
                return regex.test(fullPath);
              }
              return fullPath === pattern;
            });
            if (isIncluded) {
              shouldInclude = true;
            }
          }

          if (shouldInclude) {
            result[key] =
              typeof value === 'object' && value !== null ? processObject(value, fullPath) : value;
          }
        });
        return result;
      };

      return processObject(item);
    });
  }

  return {
    pagination: searchQuery.page_key
      ? {
          total,
          items_left: left < 0 ? 0 : left,
          page_size: searchQuery.page_size,
          page_key: nextCursor || null,
          has_more: left > 0,
        }
      : {
          total,
          page_size: searchQuery.page_size,
          pages: Math.ceil(total / searchQuery.page_size),
          page: searchQuery.page,
          prev: searchQuery.page > 1 ? searchQuery.page - 1 : null,
          next: has_next,
          page_key: nextCursor || null,
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
