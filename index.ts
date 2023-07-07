// import { ApolloServer } from "apollo-server-lambda";
import { resolvers } from "./src/graphql/resolvers";
import { typeDefs } from "./src/graphql/schema.graphql";

// const server = new ApolloServer({ 
//     typeDefs, 
//     resolvers
// });

// export const graphqlHandler = server.createHandler();


const express = require('express');
const serverless = require('serverless-express');
const { ApolloServer } = require('apollo-server-express');

const app = express();

// Enable CORS
app.use((req: any, res: { header: (arg0: string, arg1: string) => void; }, next: () => void) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// ... Define your GraphQL schema and resolvers

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.applyMiddleware({ app });

// Create the serverless handler
const graphqlHandler = serverless(app);

module.exports = { graphqlHandler };