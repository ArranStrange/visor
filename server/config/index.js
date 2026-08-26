const dotenv = require("dotenv");
dotenv.config();

// Every link in a verification or password-reset email is built from APP_URL.
// If it is unset in production, emailService silently falls back to localhost
// and the mail goes out with dead links — a failure nobody notices until a user
// reports they cannot verify. Fail at boot instead.
if (process.env.NODE_ENV === "production" && !process.env.APP_URL) {
  console.error(
    "[config] APP_URL is required in production: email links are built from it."
  );
  process.exit(1);
}

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
