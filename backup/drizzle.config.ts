import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config();

export default defineConfig({
  dialect: 'turso',
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});

// export default {
//   schema: './src/db/schema.ts',
//   driver: 'turso',
//   dialect: 'sqlite',
//   dbCredentials: {
//     url: process.env.TURSO_DATABASE_URL! as string,
//     authToken: process.env.TURSO_AUTH_TOKEN! as string,
//   },
//   out: './drizzle',
//   verbose: true,
//   strict: true,
// } satisfies Config;
