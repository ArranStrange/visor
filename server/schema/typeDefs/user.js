const { gql } = require("apollo-server-express");

module.exports = gql`
  type User {
    id: ID!
    username: String!
    avatar: String
    bio: String
    email: String!
    emailVerified: Boolean!
    instagram: String
    cameras: [String]
    """
    Canonical catalogue name of the body the app personalises for, e.g.
    "X-T30 II". Null when the user has not picked one.
    """
    primaryCamera: String
    isAdmin: Boolean!
    presets: [Preset!]!
    filmSims: [FilmSim!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type RegisterResponse {
    success: Boolean!
    message: String!
    requiresVerification: Boolean!
    user: User
  }

  type VerifyEmailResponse {
    success: Boolean!
    message: String!
    user: User
  }

  type ResendVerificationResponse {
    success: Boolean!
    message: String!
  }

  "Outcome of an account-management action, with a message safe to show the user."
  type SimpleResponse {
    success: Boolean!
    message: String!
  }

  extend type Query {
    getUser(id: ID!): User
    getCurrentUser: User
    searchUsers(query: String!): [User]
  }

  extend type Mutation {
    login(email: String!, password: String!): AuthPayload!
    register(
      username: String!
      email: String!
      password: String!
      "Hidden form field. Real users leave it empty; bots that fill every input are rejected."
      honeypot: String
    ): RegisterResponse!
    verifyEmail(token: String!): VerifyEmailResponse!
    resendVerificationEmail(email: String!): ResendVerificationResponse!
    updateProfile(input: JSON!): User
    uploadAvatar(file: Upload!): String

    """
    Sends a reset link if the address has an account. Always reports success so
    the response cannot be used to discover which addresses are registered.
    """
    requestPasswordReset(email: String!): SimpleResponse!
    resetPassword(
      token: String!
      email: String!
      newPassword: String!
    ): SimpleResponse!

    "Changes the password and signs out every other session."
    changePassword(currentPassword: String!, newPassword: String!): SimpleResponse!

    """
    Starts an email change. The new address must be verified before it takes
    effect, so the account is never left pointing at an address nobody owns.
    """
    changeEmail(currentPassword: String!, newEmail: String!): SimpleResponse!

    """
    Anonymises the account and signs it out everywhere. Uploaded presets, film
    sims and discussion posts stay readable, attributed to a deleted user.
    """
    deleteAccount(currentPassword: String!): SimpleResponse!
  }
`;
