import { NextResponse } from 'next/server';
import { parse as qsParse } from 'qs-esm';
import { z } from 'zod';

// Make WhereClause more explicit
// export type WhereClause<T> = {
//   [K in keyof T]?: OperatorRecord<T[K]>;
// };

// Define what each field's where clause looks like
// export type FieldWhereClause<T> = {
//   [P in Operator]?: T;
// };

// // Define the complete where clause type
// export type WhereClause<T> = {
//   [K in keyof T]?: FieldWhereClause<T[K]>;
// };

// // The final validation result type
// export type ValidationResult<T extends z.ZodSchema> = z.infer<T> & {
//   where?: {
//     [K in keyof z.infer<T>]?: FieldWhereClause<z.infer<T>[K]>;
//   };
// };

// export type WhereClause<T> = {
//   [K in keyof T]: Record<Operator, T[K]> & {
//     eq?: number;
//     gt?: number;
//     lt?: number;
//     gte?: number;
//     lte?: number;
//     like?: string;
//   };
// };

// // Then our ValidationResult type
// export type ValidationResult<T extends z.ZodSchema> = z.infer<T> & {
//   where?: {
//     // [K in keyof z.infer<T>]?: OperatorRecord<z.infer<T>[K]>;
//     [K in keyof z.infer<T>]?: {
//       [P in Operator]?: {
//         [Q in keyof WhereClause<T>[K]]?: WhereClause<T>[K][Q]
//       }
//     }
//   };
// };

export type ErrorResult = {
  message: string;
  status: number;
  error?: any;
  details?: z.ZodIssue[];
};

// // Define operators
// export const Operators = ['eq', 'gt', 'lt', 'gte', 'lte', 'like'] as const;
// export type Operator = (typeof Operators)[number];

// // Define the where clause type that maintains schema inference
// export type WhereClause<T> = {
//   [K in keyof T]?: {
//     [P in Operator]?: T[K];
//   };
// };

// // Define the complete validation result type
// export type ValidationResult<T extends z.ZodSchema> = z.infer<T> & {
//   where?: WhereClause<z.infer<T>>;
// };

// Helper function to convert where values
// function convertWhereValues<T extends z.ZodSchema>(
//   where: Record<string, Record<string, any>>,
//   schema: T,
// ): WhereClause<z.infer<T>> {
//   if (!where) return where;

//   const result = {} as WhereClause<z.infer<T>>;
//   const shape = (schema as any).shape as Record<string, z.ZodType>;

//   for (const [key, conditions] of Object.entries(where)) {
//     if (key in shape) {
//       result[key as keyof z.infer<T>] = {};

//       for (const [op, value] of Object.entries(conditions)) {
//         if (Operators.includes(op as Operator)) {
//           try {
//             const parsed = shape[key].parse(value);
//             (result[key as keyof z.infer<T>] as any)[op] = parsed;
//           } catch {
//             (result[key as keyof z.infer<T>] as any)[op] = value;
//           }
//         }
//       }
//     }
//   }

//   return result;
// }

// // The final validation result type with fully expanded where clause
// export type ValidationResult<T extends z.ZodSchema> = z.infer<T> & {
//   where?: {
//     [K in keyof z.infer<T>]?: {
//       eq?: number;
//       gt?: number;
//       lt?: number;
//       gte?: number;
//       lte?: number;
//       like?: string;
//     };
//   };
// };

// export const Operators = ['eq', 'gt', 'lt', 'gte', 'lte', 'like'] as const;
// type Operator = typeof Operators[number];

export const operators = ['eq', 'gt', 'lt', 'gte', 'lte', 'like'] as const;
export type Operator = (typeof operators)[number];

// All fields get all operators, with 'like' always returning string
type FieldOperators<T> = {
  eq?: T;
  gt?: T;
  lt?: T;
  gte?: T;
  lte?: T;
  like?: string;
};

// The final validation result type
export type ValidationResult<T extends z.ZodSchema> = z.infer<T> & {
  where?: {
    [K in keyof z.infer<T>]?: FieldOperators<z.infer<T>[K]>;
  };
};

// // Helper function to convert where values
// function convertWhereValues<T extends z.ZodSchema>(
//   where: Record<string, Record<string, any>>,
//   schema: T,
// ): ValidationResult<T>['where'] {
//   if (!where) return undefined;

//   const result = {} as ValidationResult<T>['where'];
//   const shape = (schema as any).shape as Record<string, z.ZodType>;

//   for (const [key, conditions] of Object.entries(where)) {
//     if (key in shape) {
//       result[key] = {};

//       for (const [op, value] of Object.entries(conditions)) {
//         if (Operators.includes(op as Operator)) {
//           try {
//             const parsed = shape[key].parse(value);
//             (result[key] as any)[op] = parsed;
//           } catch {
//             (result[key] as any)[op] = value;
//           }
//         }
//       }
//     }
//   }

//   return result;
// }

function convertWhereValues<T extends z.ZodSchema>(
  where: Record<string, Record<string, any>>,
  schema: T,
): ValidationResult<T>['where'] {
  if (!where) return undefined;

  const result = {} as ValidationResult<T>['where'];
  const shape = (schema as any).shape as Record<string, z.ZodType>;

  for (const [key, conditions] of Object.entries(where)) {
    if (key in shape) {
      result[key] = {};

      // const fieldType = shape[key];
      // const isNumber = fieldType instanceof z.ZodNumber;
      // const isString = fieldType instanceof z.ZodString;
      // const isBoolean = fieldType instanceof z.ZodBoolean;

      for (const [operator, value] of Object.entries(conditions)) {
        // const isValidOperator = (
        //   (isNumber && NumericOperators.includes(op as NumericOperator)) ||
        //   (isString && StringOperators.includes(op as StringOperator)) ||
        //   (isBoolean && BooleanOperators.includes(op as BooleanOperator))
        // );

        if ((schema as any).shape[key]) {
          result[key][operator] = (schema as any).shape[key].parse(value);
        } else {
          result[key][operator] = value;
        }

        // if (operators.includes(op as Operator)) {
        //   try {
        //     const parsed = shape[key].parse(value);
        //     (result[key] as any)[op] = parsed;
        //   } catch {
        //     (result[key] as any)[op] = value;
        //   }
        // }
      }
    }
  }

  return result;
}

// Main validation function with proper typing
export function validateInput<TSchema extends z.ZodSchema>(
  {
    req,
    input,
    where,
    params,
  }: {
    req: Request;
    input: any;
    where?: Record<string, Record<string, any>>;
  } & BasicHandlerContext<TSchema>,
  schema: TSchema,
  handler: (req: Request, ctx: BasicHandlerContext<TSchema>) => Promise<any>,
) {
  try {
    const validatedInput = schema.parse(input);
    console.log('validateInput:', { input, validatedInput });
    const searchQuery = {
      ...validatedInput,
      where: where ? convertWhereValues(where, schema) : undefined,
    } as ValidationResult<TSchema>;

    return handler(req, { params, searchQuery });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        status: 400,
        message: 'Input parameters validation failed',
        error,
      } as ErrorResult;
    }

    return {
      status: 500,
      message: 'Fatal server failure',
      error: {
        name: error.name,
        code: error.code,
        message:
          error.code === 'SQLITE_CONSTRAINT'
            ? error.message.split('SQLITE_CONSTRAINT: ')[1]
            : error.message,
      },
    } as ErrorResult;
  }
}

export type BasicHandlerContext<TSchema extends z.ZodSchema> = {
  params: Promise<{ [key: string]: string | number }>;
  searchQuery: ValidationResult<TSchema>;
};

// Route handler wrapper with proper typing
export function withValidation<TSchema extends z.ZodSchema>(
  schema: TSchema,
  handler: (req: Request, ctx: BasicHandlerContext<TSchema>) => Promise<any>,
) {
  return async function (req: Request, ctx: BasicHandlerContext<TSchema>) {
    const url = new URL(req.url);

    const { where, ...input } = qsParse(url.search.slice(1));

    console.log('withValidation:', { ctx, input });
    const result = await validateInput(
      {
        ...ctx,
        req,
        input,
        where: where as Record<string, Record<string, any>>,
      },
      schema,
      handler,
    );

    if (result instanceof NextResponse || result instanceof Response) {
      return result;
    }

    if ('error' in result) {
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
      { status: result.status || 200, headers: result.headers || new Headers() },
    );
  };
}

export function withIncludesExcludes(results: any[], searchQuery: any) {
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

  return results;
}
