// Whether a decoded JWT still refers to a usable account.
//
// Kept separate from the middleware so the rules are unit-testable without a
// database or an Express request. Both checks matter because the middleware
// re-reads the user on every request: the token itself is never revoked, so
// these are the only things standing between an old token and a live session.

// JWT `iat` is whole seconds, while credentialsChangedAt is millisecond-precise.
// Comparing at second granularity keeps a token minted in the same second as
// the change (the fresh one handed back by changePassword) valid.
const tokenPredatesCredentialChange = (issuedAtSeconds, credentialsChangedAt) => {
  if (!credentialsChangedAt) return false;
  if (typeof issuedAtSeconds !== "number" || !Number.isFinite(issuedAtSeconds)) {
    // A token with no usable iat cannot be proven to postdate the change, so
    // treat it as stale rather than trusting it.
    return true;
  }
  const changedAtSeconds = Math.floor(
    new Date(credentialsChangedAt).getTime() / 1000
  );
  return issuedAtSeconds < changedAtSeconds;
};

// Returns null when the session is valid, or a short reason for logging.
const sessionRejectionReason = (user, decodedToken) => {
  if (!user) return "no such user";
  if (user.deletedAt) return "account deleted";
  if (tokenPredatesCredentialChange(decodedToken?.iat, user.credentialsChangedAt)) {
    return "credentials changed after token was issued";
  }
  return null;
};

module.exports = { sessionRejectionReason, tokenPredatesCredentialChange };
