import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { typeDefs, resolvers } from "./schema.js";

async function start() {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginLandingPageLocalDefault()],
  });
  await server.start();

  app.use(
    "/graphql",
    cors({ origin: ["http://localhost:3000"] }),
    express.json(),
    expressMiddleware(server)
  );

  const port = 4000;
  app.listen(port, () => {
    console.log(`🚀 GraphQL ready at http://localhost:${port}/graphql`);
  });
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
