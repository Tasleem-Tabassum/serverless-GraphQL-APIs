import { ApolloServer } from "apollo-server-lambda";
import { resolvers } from "./src/graphql/resolvers";
import { typeDefs } from "./src/graphql/schema.graphql";

const server = new ApolloServer({ 
    typeDefs, 
    resolvers
});

export const graphqlHandler = server.createHandler();