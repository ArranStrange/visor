const assert = require("node:assert/strict");
const test = require("node:test");

const {
  createToken,
  hashToken,
  tokensMatch,
  TOKEN_BYTES,
} = require("../authTokens");

test("createToken returns a raw token and its digest", () => {
  const { raw, hash } = createToken();
  assert.equal(raw.length, TOKEN_BYTES * 2, "raw token is hex-encoded");
  assert.equal(hash.length, 64, "sha256 digest is 64 hex characters");
  assert.notEqual(raw, hash, "the raw token is never its own digest");
});

test("createToken does not repeat itself", () => {
  const seen = new Set();
  for (let i = 0; i < 100; i += 1) seen.add(createToken().raw);
  assert.equal(seen.size, 100);
});

test("hashToken is deterministic", () => {
  assert.equal(hashToken("abc123"), hashToken("abc123"));
  assert.notEqual(hashToken("abc123"), hashToken("abc124"));
});

test("hashToken rejects non-string and empty input", () => {
  assert.equal(hashToken(undefined), null);
  assert.equal(hashToken(null), null);
  assert.equal(hashToken(""), null);
  assert.equal(hashToken(42), null);
  assert.equal(hashToken({}), null);
});

test("tokensMatch accepts the raw token for a stored digest", () => {
  const { raw, hash } = createToken();
  assert.equal(tokensMatch(raw, hash), true);
});

test("tokensMatch rejects a wrong token", () => {
  const { hash } = createToken();
  const other = createToken();
  assert.equal(tokensMatch(other.raw, hash), false);
});

test("tokensMatch rejects the stored digest presented as the raw token", () => {
  // A database reader holds the digest, not the token. Presenting the digest
  // back must not authenticate — this is the whole point of hashing.
  const { hash } = createToken();
  assert.equal(tokensMatch(hash, hash), false);
});

test("tokensMatch rejects missing input on either side", () => {
  const { raw, hash } = createToken();
  assert.equal(tokensMatch(undefined, hash), false);
  assert.equal(tokensMatch("", hash), false);
  assert.equal(tokensMatch(raw, undefined), false);
  assert.equal(tokensMatch(raw, null), false);
  assert.equal(tokensMatch(raw, ""), false);
});
