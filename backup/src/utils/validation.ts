import { NextRequest, NextResponse } from 'next/server';
import { NextContext, NextRequestWithUnkeyContext, withUnkey } from '@unkey/nextjs';
import { parse as qsParse } from 'qs-esm';
import { z } from 'zod';

export type ErrorResult = {
  message: string;
  status: number;
  error?: any;
  details?: z.ZodIssue[];
};

export const operators = ['eq', 'gt', 'lt', 'gte', 'lte', 'like'] as const;
export type Operator = (typeof operators)[number];

// All fields get all operators, with 'like' always returning string
export type FieldOperators<T> = {
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

export type BasicHandlerContext<TSchema extends z.ZodSchema> = {
  params: Promise<{ [key: string]: string | number }>;
  searchQuery: ValidationResult<TSchema>;
};

export function convertWhereValues<T extends z.ZodSchema>(
  where: Record<string, Record<string, any>>,
  schema: T,
): ValidationResult<T>['where'] {
  if (!where) return undefined;

  const result = {} as ValidationResult<T>['where'];
  const shape = (schema as any).shape as Record<string, z.ZodType>;

  for (const [key, conditions] of Object.entries(where)) {
    if (key in shape) {
      result[key] = {};

      for (const [operator, value] of Object.entries(conditions)) {
        result[key][operator] = (schema as any).shape[key]
          ? (schema as any).shape[key].parse(value)
          : value;
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
  handler: (_req: Request, _ctx: BasicHandlerContext<TSchema>) => Promise<any>,
) {
  try {
    const validatedInput = schema.parse(input);
    // console.log('validateInput:', { input, validatedInput });
    const searchQuery = {
      ...validatedInput,
      where: where ? convertWhereValues(where, schema) : undefined,
    } as ValidationResult<TSchema>;

    return handler(req, { params, searchQuery });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return {
        status: 400,
        message: 'Input parameters validation failed',
        error: err,
      } as ErrorResult;
    }

    return {
      status: 500,
      message: 'Fatal server failure',
      error: {
        name: err.name,
        code: err.code,
        message:
          err.code === 'SQLITE_CONSTRAINT'
            ? err.message.split('SQLITE_CONSTRAINT: ')[1]
            : err.message,
      },
    } as ErrorResult;
  }
}

// Route handler wrapper with proper typing
export function withValidation<TSchema extends z.ZodSchema>(
  schema: TSchema,
  handler: (req: Request, ctx: BasicHandlerContext<TSchema>) => Promise<any>,
) {
  return withUnkey(validate, {
    onError: async (req, res) =>
      NextResponse.json(
        {
          error: {
            message: res.message || 'Unauthorized',
            httpStatus: 500,
          },
        },
        { status: 500 },
      ),
    handleInvalidKey: async (req, res) =>
      NextResponse.json(
        {
          error: {
            message: 'Unauthorized',
            httpStatus: 401,
          },
        },
        { status: 401 },
      ),
  });

  async function validate(
    req: NextRequest | Request | NextRequestWithUnkeyContext,
    ctx: BasicHandlerContext<TSchema> | NextContext,
  ) {
    const url = new URL(req.url);

    const { where, ...input } = qsParse(url.search.slice(1));

    // console.log('withValidation:', { ctx, input });
    const result = await validateInput(
      {
        ...ctx,
        req,
        input,
        where: where as Record<string, Record<string, any>>,
      } as any,
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
  }
}

export function withIncludesExcludes(results: any[], searchQuery: any) {
  const include = searchQuery.include?.split(',').filter(Boolean);
  const exclude = searchQuery.exclude?.split(',').filter(Boolean);

  if (include || exclude) {
    results = results.map((item: any): any => {
      const processObject = (obj: any, prefix = ''): any => {
        if (!obj || typeof obj !== 'object') return obj;

        const result: Record<string, any> = {};
        for (const [key, value] of Object.entries(obj)) {
          const fullPath = prefix ? `${prefix}.${key}` : key;
          let shouldInclude = true;

          if (exclude) {
            // Check if field or its parent should be excluded
            const isExcluded = exclude.some((pattern) => {
              if (pattern.includes('*')) {
                const regexPattern = pattern.replaceAll('.', '\\.').replaceAll('*', '.*');
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
                const regexPattern = pattern.replaceAll('.', '\\.').replaceAll('*', '.*');
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
        }
        return result;
      };

      return processObject(item);
    });
  }

  return results;
}
