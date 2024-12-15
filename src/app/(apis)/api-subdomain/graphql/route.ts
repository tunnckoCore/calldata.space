// import { useResponseCache } from '@graphql-yoga/plugin-response-cache';
// import { renderGraphiQL } from '@graphql-yoga/render-graphiql';
import { buildSchema } from 'drizzle-graphql';
import { createYoga } from 'graphql-yoga';

import { db } from '@/db/index.ts';

const { schema } = buildSchema(db);
const { handleRequest } = createYoga({
  schema,
  graphiql: true,
  batching: true,
  landingPage: false,
  // renderGraphiQL,
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Request, Response },
  // plugins: [
  //   // useResponseCache({ session: () => null }),
  //   // useSofa({
  //   //   basePath: '/rest',
  //   //   swaggerUI: {
  //   //     endpoint: '/swagger',
  //   //   },
  //   //   openAPI: {
  //   //     servers: [{ url: '/rest' }],
  //   //     endpoint: '/rest/openapi',
  //   //     info: {
  //   //       title: 'Eths API',
  //   //       description: 'Ethscriptions API with Drizzle, GraphQL Yoga, Next.js and Turso SQLite',
  //   //       version: '0.1.0',
  //   //     },
  //   //   },
  //   // }),
  // ],
});

// const { handleRequest } = createYoga({ schema, graphqlEndpoint: '/api/graphql' });

export { handleRequest as GET, handleRequest as OPTIONS, handleRequest as POST };
