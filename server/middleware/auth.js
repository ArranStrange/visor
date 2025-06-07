const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; // use env var in prod

// Middleware to verify JWT and attach user to request
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Format: "Bearer <token>"

  if (!token) {
    req.user = null; // guest access
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// GraphQL context helper
const contextFromRequest = async (req) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return { user: null };

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    return { user };
  } catch {
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
  authenticate,
  contextFromRequest,
  requireRole,
};
