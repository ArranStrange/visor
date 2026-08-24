const {
  AuthenticationError,
  UserInputError,
  ApolloError,
} = require("apollo-server-express");

// Backed by Apollo's error classes so extensions.code survives to the
// client (UNAUTHENTICATED / BAD_USER_INPUT), which the discussion UI
// branches on. ValidationError keeps its custom code.
class ValidationError extends ApolloError {
  constructor(message) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

module.exports = {
  AuthenticationError,
  ValidationError,
  UserInputError,
};
