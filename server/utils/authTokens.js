const crypto = require("crypto");

// Single-use email tokens (verification, password reset) are handed to the user
// in a URL but stored only as a SHA-256 digest. A database read therefore does
// not hand over the ability to verify an address or reset a password.
//
// SHA-256 without a salt or work factor is deliberate: these are 256 bits of
// crypto-random data with a short expiry, so there is nothing to brute-force
// and nothing to precompute. Passwords are a different problem and keep bcrypt.

const TOKEN_BYTES = 32;

const hashToken = (rawToken) => {
  if (typeof rawToken !== "string" || rawToken.length === 0) return null;
  return crypto.createHash("sha256").update(rawToken).digest("hex");
};

// Returns the raw token to email out, plus the digest to persist. The raw value
// is never stored, so a lost email cannot be recovered — only reissued.
const createToken = () => {
  const raw = crypto.randomBytes(TOKEN_BYTES).toString("hex");
  return { raw, hash: hashToken(raw) };
};

// Constant-time comparison so a token digest cannot be recovered by timing the
// comparison. Both sides are hex digests of known length here, but the lookups
// that use this are cheap enough that there is no reason to leak the timing.
const tokensMatch = (rawToken, storedHash) => {
  const candidate = hashToken(rawToken);
  if (!candidate || typeof storedHash !== "string") return false;
  if (candidate.length !== storedHash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(storedHash));
};

module.exports = { createToken, hashToken, tokensMatch, TOKEN_BYTES };
