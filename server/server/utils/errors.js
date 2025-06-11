class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthenticationError";
    this.code = "AUTHENTICATION_ERROR";
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.code = "VALIDATION_ERROR";
  }
}

class UserInputError extends Error {
  constructor(message) {
    super(message);
    this.name = "UserInputError";
    this.code = "USER_INPUT_ERROR";
  }
}

module.exports = {
  AuthenticationError,
  ValidationError,
  UserInputError,
};
