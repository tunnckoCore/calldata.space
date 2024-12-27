import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSchema } from 'drizzle-graphql';

import { db } from '../index.ts';

const { schema } = buildSchema(db);

const server = new ApolloServer({ schema });
const { url } = await startStandaloneServer(server, { listen: { port: 4001 } });

console.log(`🚀 Server ready at ${url}`);
