// The client-side mirror of the server's validatePassword
// (server/schema/resolvers/user/services/userAuth.js). Kept in one place so
// registration, reset and change-password all reject the same passwords, and
// so a rule change is a two-file edit rather than a hunt.
//
// The server remains the authority — this exists to fail fast in the form
// instead of after a round trip.

export const MIN_PASSWORD_LENGTH = 8;

/** Returns an error message, or null when the password is acceptable. */
export const validatePassword = (password: string): string | null => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`;
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  return null;
};

/** What to tell someone before they have typed anything wrong. */
export const PASSWORD_HINT = `At least ${MIN_PASSWORD_LENGTH} characters, including one capital letter.`;
