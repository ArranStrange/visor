const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./config/jwt");
const User = require("./models/User");
const { graphqlUploadExpress } = require("graphql-upload");

dotenv.config();

const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");
const scalarsTypeDefs = require("./schema/typeDefs/scalars");
const presetTypeDefs = require("./schema/typeDefs/preset");
const filmSimTypeDefs = require("./schema/typeDefs/filmSim");
const listTypeDefs = require("./schema/typeDefs/list");
const tagTypeDefs = require("./schema/typeDefs/tag");
const userTypeDefs = require("./schema/typeDefs/user");
const discussionTypeDefs = require("./schema/typeDefs/discussion");
const notificationTypeDefs = require("./schema/typeDefs/notification");
const commentTypeDefs = require("./schema/typeDefs/comment");
const imageTypeDefs = require("./schema/typeDefs/image");
const scalarsResolvers = require("./schema/resolvers/scalars");
const commentResolvers = require("./schema/resolvers/comment");
const imageResolvers = require("./schema/resolvers/image");
const presetResolvers = require("./schema/resolvers/preset");
const filmSimResolvers = require("./schema/resolvers/filmSim");
const listResolvers = require("./schema/resolvers/list");
const tagResolvers = require("./schema/resolvers/tag");
const userResolvers = require("./schema/resolvers/user");
const discussionResolvers = require("./schema/resolvers/discussion");
const notificationResolvers = require("./schema/resolvers/notification");

const typeDefs = mergeTypeDefs([
  scalarsTypeDefs,
  presetTypeDefs,
  filmSimTypeDefs,
  listTypeDefs,
  tagTypeDefs,
  userTypeDefs,
  discussionTypeDefs,
  notificationTypeDefs,
  commentTypeDefs,
  imageTypeDefs,
]);
const resolvers = mergeResolvers([
  scalarsResolvers,
  commentResolvers,
  imageResolvers,
  presetResolvers,
  filmSimResolvers,
  listResolvers,
  tagResolvers,
  userResolvers,
  discussionResolvers,
  notificationResolvers,
]);

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGODB_URI;
const NODE_ENV = process.env.NODE_ENV || "development";
const RENDER_URL = process.env.RENDER_URL || "http://localhost:4000";

if (!MONGO_URI) {
  console.error("MONGODB_URI environment variable is not set");
  process.exit(1);
}

if (!MONGO_URI.startsWith("mongodb+srv://")) {
  console.error("MONGODB_URI must start with 'mongodb+srv://'");
  console.error("Current URI format:", MONGO_URI.split("@")[0] + "@****");
  process.exit(1);
}

try {
  const uriParts = MONGO_URI.split("@");
  if (uriParts.length !== 2) {
    throw new Error("Invalid URI format");
  }

  const [protocol, rest] = uriParts;
  if (!protocol.startsWith("mongodb+srv://")) {
    throw new Error("Invalid protocol");
  }

  const [credentials, host] = rest.split("/");
  if (!credentials || !host) {
    throw new Error("Missing credentials or host");
  }

  console.log("MongoDB URI format validation passed");
  console.log("Protocol:", protocol);
  console.log("Host:", host.split("?")[0]);
} catch (error) {
  console.error("MongoDB URI validation failed:", error.message);
  process.exit(1);
}

const startServer = async () => {
  const app = express();

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins =
      NODE_ENV === "production"
        ? ["https://visor-c51a1.web.app", "https://visor-c51a1.firebaseapp.com"]
        : [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:3000",
            "https://visor-c51a1.web.app",
            "https://visor-c51a1.firebaseapp.com",
          ];

    if (origin && allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    }

    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    next();
  });

  app.use(express.json());
  app.use(graphqlUploadExpress());

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      environment: NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    persistedQueries: {
      cache: "bounded",
    },
    context: async ({ req }) => {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.split(" ")[1];

      if (!token) {
        return { user: null };
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        if (!userId) {
          return { user: null };
        }

        const user = await User.findById(userId);

        if (!user) {
          return { user: null };
        }

        return {
          user: {
            ...user.toObject(),
            id: user._id,
          },
        };
      } catch (err) {
        console.error("Authentication error:", err.message);
        return { user: null };
      }
    },
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
    console.log("MongoDB URI:", MONGO_URI.replace(/:[^:@]*@/, ":****@"));

    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running in ${NODE_ENV} mode`);
      console.log(`🚀 Server running at ${RENDER_URL}`);
      console.log(`🚀 GraphQL endpoint: ${RENDER_URL}${server.graphqlPath}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

startServer();
