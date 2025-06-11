const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./config/jwt");
const User = require("./models/User");

dotenv.config();

const typeDefs = require("./schema/typeDefs");
const resolvers = require("./schema/resolvers");

const PORT = process.env.PORT || 4000;
// Ensure MongoDB URI is properly formatted
const MONGO_URI = process.env.MONGODB_URI
  ? process.env.MONGODB_URI.startsWith("mongodb://") ||
    process.env.MONGODB_URI.startsWith("mongodb+srv://")
    ? process.env.MONGODB_URI
    : `mongodb://${process.env.MONGODB_URI}`
  : "mongodb://localhost:27017/visor";

const NODE_ENV = process.env.NODE_ENV || "development";
const RENDER_URL = process.env.RENDER_URL || "http://localhost:4000";

const startServer = async () => {
  const app = express();

  // Configure CORS based on environment
  const corsOptions = {
    origin:
      NODE_ENV === "production" ? [process.env.CLIENT_URL, RENDER_URL] : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
  app.use(cors(corsOptions));

  app.use(express.json());

  // Health check endpoint for Render
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      environment: NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  // Serve uploaded images
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    persistedQueries: {
      cache: "bounded",
    },
    context: async ({ req }) => {
      // Get the token from the Authorization header
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
    });

    // Add MongoDB connection options
    const mongooseOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(MONGO_URI, mongooseOptions);
    console.log("✅ MongoDB connected");

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

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

startServer();
