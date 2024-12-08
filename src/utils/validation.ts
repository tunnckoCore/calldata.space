import { NextRequest, NextResponse } from 'next/server';
import { parse as qsParse } from 'qs-esm';
import { z } from 'zod';

export type ErrorResult = {
  message: string;
  status: number;
  error?: any;
  details?: z.ZodIssue[];
};

// First define our operator types
type Operators = 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'like';

// // Define what a comparison value looks like
// type ComparisonValue<T> =
//   | {
//     operator: ComparisonOperator;
//     value: T;
//   }
//   | {
//     operator: 'range';
//     min: T;
//     max: T;
//   };

// // Type for wildcard text search
// type WildcardValue = {
//   wildcard: true;
//   value: string;
// };

/*

where[block_number][gt]=123

*/

type ConvertValue<T> = T extends number ? string | number : T;

type WhereClause<T extends z.ZodSchema> = {
  [K in keyof z.infer<T>]?: {
    [P in Operators]?: ConvertValue<z.infer<T>[K]>;
  };
};

// Add a function to convert values based on schema
function convertWhereValues<T extends z.ZodSchema>(
  where: WhereClause<T>,
  schema: T,
): WhereClause<T> {
  if (!where) return where;

  const result: any = {};
  for (const [key, conditions] of Object.entries(where)) {
    result[key] = {};

    for (const [operator, value] of Object.entries(conditions)) {
      // Convert string numbers to actual numbers if the schema expects a number

      if ((schema as any).shape[key]) {
        result[key][operator] = (schema as any).shape[key].parse(value);
      } else {
        result[key][operator] = value;
      }

      // console.log('convertWhereValues:', key, operator, result[key][operator])
    }
  }
  return result;
}

export function validateInput<TT, TSchema extends z.ZodSchema = z.ZodSchema>(
  { req, request, input, where }: any,
  schema: TSchema,
  handler: (
    req: NextRequest & { params: z.infer<TSchema> },
    params: z.infer<TSchema> & { where: WhereClause<TSchema> },
  ) => TT,
) {
  try {
    const $req = req || request || {};
    const params = schema.parse(input);

    if (where) {
      params.where = convertWhereValues(where, schema);
    }

    // @ts-ignore bruh
    $req.params = params;
    // @ts-ignore bruh
    $req.where = where;

    return handler($req, params) as TT;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        status: 400,
        message: 'Input parameters validation failed',
        error,
      } as ErrorResult;
    }

    // Handle any errors
    console.error('Failure:', error);
    const msg = error.toString();
    const err = {
      name: error.name,
      code: error.code,
      message: error.code === 'SQLITE_CONSTRAINT' ? msg.split('SQLITE_CONSTRAINT: ')?.[1] : msg,
    };
    return { status: 500, message: 'Fatal server failure', error: err } as ErrorResult;
  }
}

export function withValidation<TSchema extends z.ZodSchema = z.ZodSchema>(
  schema: TSchema,
  handler: (
    req: NextRequest & { params: z.infer<TSchema> },
    params: z.infer<TSchema> & { where: WhereClause<TSchema> },
  ) => any,
) {
  return async function (req: NextRequest) {
    const url = new URL(req.url);
    const input = qsParse(url.search.slice(1));

    const { where } = input;
    delete input.where;
    const result = await validateInput({ req, input, where }, schema, handler);

    if (result instanceof NextResponse || result instanceof Response) {
      return result;
    }

    if (result.error) {
      return NextResponse.json(
        {
          status: result.status,
          message: result.message,
          error: result.error,
        },
        { status: result.status, headers: result.headers || new Headers() },
      );
    }

    return NextResponse.json(
      {
        pagination: result.pagination,
        data: result.data,
      },
      {
        status: result.status,
        headers: result.headers || new Headers(),
      },
    );
  };
}
