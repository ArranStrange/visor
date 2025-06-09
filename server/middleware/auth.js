const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../config/jwt");

// Middleware to verify JWT token
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Authentication failed" });
  }
};

// GraphQL context helper
const contextFromRequest = async (req) => {
  console.log("GraphQL context - Headers:", req.headers);

  const token = req.headers.authorization?.split(" ")[1];
  console.log("GraphQL context - Token:", token);

  if (!token) {
    console.log("GraphQL context - No token provided");
    return { user: null };
  }

  try {
    console.log("GraphQL context - Verifying token with secret:", JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("GraphQL context - Decoded token:", decoded);

    const userId = decoded.id;
    if (!userId) {
      console.log("GraphQL context - Token missing user ID");
      return { user: null };
    }

    console.log("GraphQL context - Looking for user with ID:", userId);
    const user = await User.findById(userId);
    console.log("GraphQL context - Found user:", user);

    if (!user) {
      console.log("GraphQL context - User not found");
      return { user: null };
    }

    const userContext = {
      ...user.toObject(),
      id: user._id,
    };
    console.log("GraphQL context - Returning user context:", userContext);
    return { user: userContext };
  } catch (err) {
    console.error("GraphQL context - Error:", err);
    if (err.name === "JsonWebTokenError") {
      console.log("GraphQL context - JWT verification failed");
    }
    if (err.name === "TokenExpiredError") {
      console.log("GraphQL context - Token expired");
    }
    return { user: null };
  }
};

// Optional: role guard middleware
const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

module.exports = {
  authMiddleware,
  contextFromRequest,
  requireRole,
};
