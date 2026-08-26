const { consume } = require("./rateLimiter");
const { UserInputError } = require("./errors");

// Budgets for the abuse-prone mutations. Generous enough that a person who
// mistypes or re-requests an email never notices, tight enough to make
// scripted enumeration and mail-bombing pointless.
//
// See rateLimiter.js: these counters are per-process and reset on deploy.
const REGISTER_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };
const PASSWORD_RESET_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };
const CHANGE_EMAIL_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };
const DELETE_ACCOUNT_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };

// Express sets req.ip from the socket, or from X-Forwarded-For when trust proxy
// is enabled. An absent IP falls back to a shared bucket rather than skipping
// the limit, so a proxy misconfiguration fails closed instead of open.
const clientKey = (req) => req?.ip || "unknown-ip";

const enforceRateLimit = (action, req, budget, extraKey) => {
  const key = extraKey
    ? `${action}:${clientKey(req)}:${extraKey}`
    : `${action}:${clientKey(req)}`;

  const result = consume(key, budget);
  if (!result.allowed) {
    throw new UserInputError(
      `Too many attempts. Please try again in ${result.retryAfterSeconds} seconds.`
    );
  }
  return result;
};

module.exports = {
  enforceRateLimit,
  REGISTER_LIMIT,
  PASSWORD_RESET_LIMIT,
  CHANGE_EMAIL_LIMIT,
  DELETE_ACCOUNT_LIMIT,
};
