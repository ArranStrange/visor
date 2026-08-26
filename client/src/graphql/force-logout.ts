// Which GraphQL error messages mean "this session is dead, sign out".
//
// Extracted from the errorLink so it can be tested, because the distinction it
// draws is easy to break by accident: a failed *authentication* (no session,
// expired token) must sign the user out, while a failed *authorisation* (signed
// in, but not an admin) must not — otherwise clicking an admin-only control
// logs an ordinary user out of the app.
//
// Matching on message text is fragile, and deliberately so for now: the server
// raises AuthenticationError for admin denials too, so `extensions.code` is
// UNAUTHENTICATED in both cases and cannot separate them. Tracked separately;
// until that changes, the message is the only signal that can tell them apart.

const SESSION_DEAD_PATTERNS = [
  "jwt expired",
  "JWT expired",
  "UNAUTHENTICATED",
  "Authentication",
];

export const shouldForceLogout = (message: string): boolean => {
  if (!message) return false;

  if (SESSION_DEAD_PATTERNS.some((pattern) => message.includes(pattern))) {
    return true;
  }

  // "Not authenticated" means no usable session; "Not authorized" means the
  // session is fine but lacks permission. Some messages contain both.
  return (
    message.includes("Not authenticated") && !message.includes("Not authorized")
  );
};
