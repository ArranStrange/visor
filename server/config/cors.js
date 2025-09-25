const config = require("../config");

module.exports = {
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
