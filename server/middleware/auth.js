const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/jwt");
const User = require("../models/User");
const { createLogger } = require("../utils/logger");

const logger = createLogger("auth");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    if (!userId) {
      req.user = null;
      return next();
    }

    const user = await User.findById(userId);

    if (!user) {
      req.user = null;
      return next();
    }

    req.user = {
      ...user.toObject(),
      id: user._id,
    };
  } catch (err) {
    logger.error("Authentication error", err);
    req.user = null;
  }

  next();
};

module.exports = authMiddleware;
