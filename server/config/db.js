const mongoose = require("mongoose");
const { createLogger } = require("../utils/logger");

const logger = createLogger("db");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error("MongoDB connection error", err);
    process.exit(1);
  }
};

module.exports = connectDB;
