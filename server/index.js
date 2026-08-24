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
const { createLogger } = require("./utils/logger");

const logger = createLogger("server");

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

    logger.info(`Connecting to MongoDB: ${maskCredentials(config.MONGO_URI)}`);
    await mongoose.connect(config.MONGO_URI);
    logger.info("MongoDB connected");

    app.listen(config.PORT, "0.0.0.0", () => {
      logger.info(`Server running in ${config.NODE_ENV} mode`);
      logger.info(`Server running at ${config.RENDER_URL}`);
      logger.info(
        `GraphQL endpoint: ${config.RENDER_URL}${server.graphqlPath}`
      );
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
