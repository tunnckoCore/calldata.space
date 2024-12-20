import { NextRequest, NextResponse } from 'next/server';
import { parse as qsParse } from 'qs-esm';
import { z } from 'zod';

import { ethscriptionParamsSchema } from './params-validation.ts';

export type ErrorResult = {
  message: string;
  status: number;
  error?: any;
  details?: z.ZodIssue[];
};

// First define our operator types
// type Operators = 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'like';

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

// import type { WhereClauseType } from './params-validation';

// // Update ValidationResult type to use WhereClauseType
// type ValidationResult<T extends z.ZodSchema> = z.infer<T> & {
//   where?: WhereClauseType<z.infer<T>>;
// };

// type ConvertValue<T> = T extends number ? string | number : T;

// // NOTE: the autocompletion for `params.where.block_number.gt` works,
// // but the type of `params.where` on hover is not inferred correctly (it's `params.where: ZodSchema`
// // instead of `params.where: Record<Operators, any>`)
// type _WhereClause<T extends z.ZodSchema> = {
//   [K in keyof z.infer<T>]?: {
//     [P in Operators]?: ConvertValue<z.infer<T>[K]>;
//   };
// };

// // type WhereClause<T> = EthscriptionParams['where']

// // Create a type that includes the schema inference and where clause
type ValidationResult<T extends z.ZodSchema> = z.infer<T> & {
  where?: WhereClauseType<T>;
};

export type EthscriptionParams = z.infer<typeof ethscriptionParamsSchema>;
const Operators = ['eq', 'gt', 'lt', 'gte', 'lte', 'like'] as const;
type Operator = (typeof Operators)[number];
type Keys = keyof EthscriptionParams;

export type WhereClauseType<T extends z.ZodSchema> = {
  [K in keyof z.infer<T>]?: Record<Operator, z.infer<T>[K]>;
};

// Add a function to convert values based on schema
function convertWhereValues<T extends z.ZodSchema>(
  where: WhereClauseType<z.infer<T>>,
  schema: T,
): WhereClauseType<z.infer<T>> {
  if (!where) return where;

  const result = {};
  for (const [key, conditions] of Object.entries(where)) {
    result[key] = {};
    if (conditions) {
      for (const [operator, value] of Object.entries(conditions)) {
        if ((schema as any).shape[key]) {
          result[key][operator as Operator] = (schema as any).shape[key].parse(value);
        } else {
          result[key][operator] = value;
        }

        result;
      }
    }
    // for (const [operator, value] of Object.entries(conditions)) {
    //   // Convert string numbers to actual numbers if the schema expects a number

    //   if ((schema as any).shape[key]) {
    //     result[key][operator] = (schema as any).shape[key].parse(value);
    //   } else {
    //     result[key][operator] = value;
    //   }

    //   // console.log('convertWhereValues:', key, operator, result[key][operator])
    // }
  }
  return result;
}

export function validateInput<TT, TSchema extends z.ZodSchema = z.ZodSchema>(
  { req, request, input, where }: any,
  schema: TSchema,
  handler: (
    req: NextRequest & { params: z.infer<ValidationResult<TSchema>> },
    params: z.infer<ValidationResult<TSchema>>,
  ) => TT,
) {
  try {
    const $req = req || request || {};
    const params = schema.parse(input);

    if (where) {
      // const whereOperatorSchema = z.record(z.enum(['eq', 'gt', 'lt', 'gte', 'lte', 'like']), z.any());
      // type Where = {
      //   where: {
      //     [K in keyof EthscriptionParams]: {
      //       [P in Operators]: typeof schema[K];
      //     };
      //   }
      // };
      params.where = convertWhereValues(where, schema);
    }

    // @ts-ignore bruh
    $req.params = params;
    // @ts-ignore bruh
    $req.where = params.where;

    return handler($req, params) as TT;
  } catch (err_: any) {
    if (err_ instanceof z.ZodError) {
      return {
        status: 400,
        message: 'Input parameters validation failed',
        error: err_,
      } as ErrorResult;
    }

    // Handle any errors
    console.error('Failure:', err_);
    const msg = err_.toString();
    const err = {
      name: err_.name,
      code: err_.code,
      message: err_.code === 'SQLITE_CONSTRAINT' ? msg.split('SQLITE_CONSTRAINT: ')?.[1] : msg,
    };
    return { status: 500, message: 'Fatal server failure', error: err } as ErrorResult;
  }
}

export function withValidation<TSchema extends z.ZodSchema = z.ZodSchema>(
  schema: TSchema,
  handler: (
    req: NextRequest & { params: z.infer<TSchema> },
    params: ValidationResult<TSchema>,
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
