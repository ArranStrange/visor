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

const requireOwnership = (user, doc, field = "creator", options = {}) => {
  const { allowAdmin = true, message = "Not authorized" } = options;

  const ownerId = doc && doc[field];
  const isOwner = ownerId != null && ownerId.toString() === getUserId(user);
  const isAdmin = allowAdmin && !!(user && user.isAdmin);

  if (!isOwner && !isAdmin) {
    throw new AuthenticationError(message);
  }
};

module.exports = { requireAuth, requireOwnership };
