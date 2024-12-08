import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export type ErrorResult = {
  message: string;
  status: number;
  error?: any;
  details?: z.ZodIssue[];
};

export function validateInput<TT, T extends z.ZodSchema = z.ZodSchema>(
  { req, request, input }: any,
  schema: T,
  handler: (req: NextRequest & { params: z.infer<T> }, params: z.infer<T>) => TT,
) {
  try {
    const $req = req || request || {};
    const params = schema.parse(input);

    // @ts-ignore bruh
    $req.params = params;

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

export function withValidation<T extends z.ZodSchema = z.ZodSchema>(
  schema: T,
  handler: (req: NextRequest & { params: z.infer<T> }, params: z.infer<T>) => any,
) {
  return async function (req: NextRequest) {
    const input = Object.fromEntries(new URL(req.url).searchParams);
    const result = await validateInput({ req, input }, schema, handler);

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
