import { useResponseCache } from '@graphql-yoga/plugin-response-cache';
import { buildSchema } from 'drizzle-graphql';
import { createYoga } from 'graphql-yoga';
import { createServer } from 'node:http';

import { db } from '../index.ts';

const { schema } = buildSchema(db);
const yoga = createYoga({
  schema,
  graphiql: true,
  batching: true,
  landingPage: false,
  // renderGraphiQL,
  graphqlEndpoint: '/graphql',
  fetchAPI: { Request, Response },
  plugins: [
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useResponseCache({ session: () => null }),
    // useSofa({
    //   basePath: '/rest',
    //   swaggerUI: {
    //     endpoint: '/swagger',
    //   },
    //   openAPI: {
    //     servers: [{ url: '/rest' }],
    //     endpoint: '/rest/openapi',
    //     info: {
    //       title: 'Eths API',
    //       description: 'Ethscriptions API with Drizzle, GraphQL Yoga, Next.js and Turso SQLite',
    //       version: '0.1.0',
    //     },
    //   },
    // }),
  ],
});
const server = createServer(yoga);

server.listen(4000, () => {
  console.info('Server is running on http://localhost:4000/graphql');
});
