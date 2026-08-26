const { AuthenticationError } = require("./errors");

const getUserId = (user) => {
  const id = user && (user._id || user.id);
  return id ? id.toString() : "";
};

const requireAuth = (user, message = "Not authenticated") => {
  if (!user) {
    throw new AuthenticationError(message);
  }
  return user;
};

/**
 * Gate a resolver on the admin flag. Replaces the requireAuth + `!user.isAdmin`
 * pair that was hand-rolled at a dozen call sites: the danger with a repeated
 * check is the one copy that drifts, and an admin gate that silently stops
 * gating looks exactly like one that works.
 *
 * `isAdmin` is only ever set in the database — it is not in updateProfile's
 * allow-list, so it cannot be granted over the API.
 */
const requireAdmin = (user, message = "Admin access required") => {
  requireAuth(user, message);
  if (!user.isAdmin) {
    throw new AuthenticationError(message);
  }
  return user;
};

const requireOwnership = (user, doc, field = "creator", options = {}) => {
  const { allowAdmin = true, message = "Not authorized" } = options;

  const ownerId = doc && doc[field];
  const isOwner = ownerId != null && ownerId.toString() === getUserId(user);
  const isAdmin = allowAdmin && !!(user && user.isAdmin);

  if (!isOwner && !isAdmin) {
    throw new AuthenticationError(message);
  }
};

module.exports = { requireAuth, requireAdmin, requireOwnership };
