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
    ): RegisterResponse!
    verifyEmail(token: String!): VerifyEmailResponse!
    resendVerificationEmail(email: String!): ResendVerificationResponse!
    updateProfile(input: JSON!): User
    uploadAvatar(file: Upload!): String
  }
`;
