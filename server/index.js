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
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/visor";

const startServer = async () => {
  const app = express();

  // Use CORS with credentials and allow all origins
  app.use(
    cors({
      origin: function (origin, callback) {
        callback(null, true); // Allow all origins
      },
      credentials: true, // Enable credentials
    })
  );

  app.use(express.json());

  // Serve uploaded images
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      console.log("Apollo context - Headers:", req.headers);

      // Get the token from the Authorization header
      const authHeader = req.headers.authorization || "";
      const token = authHeader.split(" ")[1];
      console.log("Apollo context - Token:", token);

      if (!token) {
        console.log("Apollo context - No token provided");
        return { user: null };
      }

      try {
        // Verify the token
        console.log(
          "Apollo context - Verifying token with secret:",
          JWT_SECRET
        );
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("Apollo context - Decoded token:", decoded);

        // Get the user ID from the token
        const userId = decoded.id;
        if (!userId) {
          console.log("Apollo context - Token missing user ID");
          return { user: null };
        }

        // Find the user
        console.log("Apollo context - Looking for user with ID:", userId);
        const user = await User.findById(userId);
        console.log("Apollo context - Found user:", user);

        if (!user) {
          console.log("Apollo context - User not found");
          return { user: null };
        }

        // Return the user in the context
        const userContext = {
          ...user.toObject(),
          id: user._id,
        };
        console.log("Apollo context - Returning user context:", userContext);
        return { user: userContext };
      } catch (err) {
        console.error("Apollo context - Error:", err);
        if (err.name === "JsonWebTokenError") {
          console.log("Apollo context - JWT verification failed");
        }
        if (err.name === "TokenExpiredError") {
          console.log("Apollo context - Token expired");
        }
        return { user: null };
      }
    },
  });

  await server.start();
  server.applyMiddleware({
    app,
    path: "/graphql",
    cors: false, // Disable Apollo's internal CORS handling
  });

  mongoose
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("✅ MongoDB connected");
      app.listen(PORT, "0.0.0.0", () =>
        console.log(
          `🚀 Server running at http://0.0.0.0:${PORT}${server.graphqlPath}`
        )
      );
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
    });
};

startServer();
