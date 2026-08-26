const assert = require("node:assert/strict");
const test = require("node:test");

const {
  sessionRejectionReason,
  tokenPredatesCredentialChange,
} = require("../sessionValidity");

const secondsAgo = (n) => Math.floor(Date.now() / 1000) - n;

test("a live account with a fresh token is accepted", () => {
  const user = { username: "arran" };
  assert.equal(sessionRejectionReason(user, { iat: secondsAgo(10) }), null);
});

test("a missing user is rejected", () => {
  assert.equal(sessionRejectionReason(null, { iat: secondsAgo(10) }), "no such user");
  assert.equal(
    sessionRejectionReason(undefined, { iat: secondsAgo(10) }),
    "no such user"
  );
});

test("a tombstoned account is rejected even though the document still exists", () => {
  // Deletion anonymises rather than removing the document, so findById still
  // returns a user. Without this check every outstanding token would keep
  // authenticating as the tombstone until it expired.
  const user = { username: "deleted_user_a1b2c3", deletedAt: new Date() };
  assert.equal(sessionRejectionReason(user, { iat: secondsAgo(10) }), "account deleted");
});

test("a token issued before a credential change is rejected", () => {
  const user = { credentialsChangedAt: new Date() };
  assert.equal(
    sessionRejectionReason(user, { iat: secondsAgo(3600) }),
    "credentials changed after token was issued"
  );
});

test("a token issued after a credential change is accepted", () => {
  const user = { credentialsChangedAt: new Date(Date.now() - 3600 * 1000) };
  assert.equal(sessionRejectionReason(user, { iat: secondsAgo(10) }), null);
});

test("the token minted by a credential change is not rejected by that change", () => {
  // iat is whole seconds while credentialsChangedAt has milliseconds, so a
  // naive comparison signs the user out of the very session that changed the
  // password. Same-second tokens must survive.
  const changedAt = new Date();
  const user = { credentialsChangedAt: changedAt };
  const iat = Math.floor(changedAt.getTime() / 1000);

  assert.equal(sessionRejectionReason(user, { iat }), null);
});

test("no credential change means nothing to compare against", () => {
  assert.equal(tokenPredatesCredentialChange(secondsAgo(10), undefined), false);
  assert.equal(tokenPredatesCredentialChange(secondsAgo(10), null), false);
});

test("a token without a usable iat is treated as stale once credentials change", () => {
  const changedAt = new Date();
  assert.equal(tokenPredatesCredentialChange(undefined, changedAt), true);
  assert.equal(tokenPredatesCredentialChange(Number.NaN, changedAt), true);
  assert.equal(tokenPredatesCredentialChange("1700000000", changedAt), true);

  // ...but with no credential change, a missing iat is not a reason to reject.
  assert.equal(tokenPredatesCredentialChange(undefined, undefined), false);
});

test("deletion takes precedence over a credential change", () => {
  const user = { deletedAt: new Date(), credentialsChangedAt: new Date() };
  assert.equal(sessionRejectionReason(user, { iat: secondsAgo(5) }), "account deleted");
});

test("a missing decoded token does not throw", () => {
  const user = { credentialsChangedAt: new Date() };
  assert.equal(
    sessionRejectionReason(user, undefined),
    "credentials changed after token was issued"
  );
  assert.equal(sessionRejectionReason({ username: "arran" }, undefined), null);
});
