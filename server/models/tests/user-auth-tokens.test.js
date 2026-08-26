const assert = require("node:assert/strict");
const test = require("node:test");

const User = require("../User");

const paths = User.schema.paths;

test("User carries separate reset token fields", () => {
  assert.ok(paths.resetTokenHash, "resetTokenHash exists");
  assert.ok(paths.resetTokenExpiry, "resetTokenExpiry exists");
  assert.equal(paths.resetTokenHash.instance, "String");
  assert.equal(paths.resetTokenExpiry.instance, "Date");
});

test("User carries credentialsChangedAt and deletedAt", () => {
  assert.equal(paths.credentialsChangedAt.instance, "Date");
  assert.equal(paths.deletedAt.instance, "Date");
});

test("generateVerificationToken stores a digest and returns the raw token", () => {
  const user = new User();
  const raw = user.generateVerificationToken();

  assert.notEqual(raw, user.verificationToken, "the raw token is not stored");
  assert.equal(user.verificationToken.length, 64, "a sha256 digest is stored");
  assert.ok(user.tokenExpiry > new Date(), "expiry is in the future");
});

test("verifyToken accepts the raw token and rejects the stored digest", () => {
  const user = new User();
  const raw = user.generateVerificationToken();

  assert.equal(user.verifyToken(raw), true);
  assert.equal(user.verifyToken(user.verificationToken), false);
  assert.equal(user.verifyToken("nonsense"), false);
});

test("verifyToken rejects an expired token", () => {
  const user = new User();
  const raw = user.generateVerificationToken();
  user.tokenExpiry = new Date(Date.now() - 1000);

  assert.equal(user.verifyToken(raw), false);
});

test("generateResetToken is independent of the verification token", () => {
  const user = new User();
  const verificationRaw = user.generateVerificationToken();
  const resetRaw = user.generateResetToken();

  assert.notEqual(resetRaw, verificationRaw);
  assert.notEqual(user.resetTokenHash, user.verificationToken);

  // Clearing the verification pair the way verifyEmail does must leave the
  // reset token usable — the reason these are separate fields at all.
  user.verificationToken = undefined;
  user.tokenExpiry = undefined;
  assert.equal(user.verifyResetToken(resetRaw), true);
});

test("reset token expires in an hour, not a day", () => {
  const user = new User();
  user.generateResetToken();
  const ttlMs = user.resetTokenExpiry.getTime() - Date.now();

  assert.ok(ttlMs <= 60 * 60 * 1000, "at most one hour");
  assert.ok(ttlMs > 55 * 60 * 1000, "about one hour");
});

test("verifyResetToken rejects wrong, expired and missing tokens", () => {
  const user = new User();
  const raw = user.generateResetToken();

  assert.equal(user.verifyResetToken("wrong"), false);
  assert.equal(user.verifyResetToken(raw), true);

  user.resetTokenExpiry = new Date(Date.now() - 1000);
  assert.equal(user.verifyResetToken(raw), false);

  const fresh = new User();
  assert.equal(fresh.verifyResetToken(raw), false, "no token issued at all");
});

test("clearResetToken makes a used link single-use", () => {
  const user = new User();
  const raw = user.generateResetToken();
  assert.equal(user.verifyResetToken(raw), true);

  user.clearResetToken();

  assert.equal(user.resetTokenHash, undefined);
  assert.equal(user.resetTokenExpiry, undefined);
  assert.equal(user.verifyResetToken(raw), false);
});
