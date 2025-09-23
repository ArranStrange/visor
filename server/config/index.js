const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 4000,
  MONGO_URI: process.env.MONGODB_URI,
  NODE_ENV: process.env.NODE_ENV || "development",
  RENDER_URL: process.env.RENDER_URL || "http://localhost:4000",
  ALLOWED_ORIGINS: {
    production: [
      "https://visor-c51a1.web.app",
      "https://visor-c51a1.firebaseapp.com",
    ],
    development: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:3000",
      "https://visor-c51a1.web.app",
      "https://visor-c51a1.firebaseapp.com",
    ],
  },
};
