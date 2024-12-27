import { Hono, MiddlewareHandler, type ValidationTargets } from "hono";
import { ZodSchema } from "zod";
export type Bindings = { VERCEL_GIT_COMMIT_SHA: string };
export type Env = {
	VERCEL_GIT_COMMIT_SHA: string;
	ENVIRONMENT: "production" | "development";
	UPLOADTHING_TOKEN: string;
};
export declare function createApp(cors?: any): Hono<{ Bindings: Bindings & Env }>;
export declare function toHonoHandler(fn: any): MiddlewareHandler;
export declare function validate(target: keyof ValidationTargets, schema: ZodSchema<any>): MiddlewareHandler;
