const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const { graphqlUploadExpress } = require("graphql-upload");

const config = require("./config");
const authMiddleware = require("./middleware/auth");
const { typeDefs, resolvers } = require("./schema");

// Validate MongoDB URI
if (!config.MONGO_URI || !config.MONGO_URI.startsWith("mongodb+srv://")) {
  console.error("MONGODB_URI must be a valid MongoDB Atlas connection string");
  process.exit(1);
}

const startServer = async () => {
  const app = express();

  // CORS configuration
  const corsOptions = {
    origin:
      config.ALLOWED_ORIGINS[
        config.NODE_ENV === "production" ? "production" : "development"
      ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  };
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
    persistedQueries: {
      cache: "bounded",
    },
    context: ({ req }) => ({ user: req.user }),
  });

  try {
    await server.start();
    server.applyMiddleware({
      app,
      path: "/graphql",
      cors: false,
      bodyParserConfig: true,
    });

    console.log("Attempting to connect to MongoDB...");
    console.log("MongoDB URI:", config.MONGO_URI.replace(/:[^:@]*@/, ":****@"));

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
