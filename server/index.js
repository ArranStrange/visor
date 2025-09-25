const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const cors = require("cors");
const { graphqlUploadExpress } = require("graphql-upload");

const config = require("./config");
const corsOptions = require("./config/cors");
const authMiddleware = require("./middleware/auth");
const { typeDefs, resolvers } = require("./schema");
const { validateMongoURI, maskCredentials } = require("./utils/validation");

validateMongoURI(config.MONGO_URI);

const startServer = async () => {
  const app = express();

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(graphqlUploadExpress());
  app.use(authMiddleware);

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      environment: config.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    persistedQueries: { cache: "bounded" },
    context: ({ req }) => ({ user: req.user }),
  });

  try {
    await server.start();
    server.applyMiddleware({ app, path: "/graphql", cors: false });

    console.log("Connecting to MongoDB:", maskCredentials(config.MONGO_URI));
    await mongoose.connect(config.MONGO_URI);
    console.log("MongoDB connected");

    app.listen(config.PORT, "0.0.0.0", () => {
      console.log(`Server running in ${config.NODE_ENV} mode`);
      console.log(`Server running at ${config.RENDER_URL}`);
      console.log(
        `GraphQL endpoint: ${config.RENDER_URL}${server.graphqlPath}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
