const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const typeDefs = require("./schema/typeDefs");
const resolvers = require("./schema/resolvers");
const { authenticate, contextFromRequest } = require("./middleware/auth");

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
      credentials: true, // Allow cookies and sessions
    })
  );

  app.use(express.json());
  app.use(authenticate); // Attach user to request if authenticated

  // Serve uploaded images
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => await contextFromRequest(req),
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
