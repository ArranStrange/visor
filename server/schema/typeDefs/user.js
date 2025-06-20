const { gql } = require("apollo-server-express");

module.exports = gql`
  type User {
    id: ID!
    username: String!
    avatar: String
    bio: String
    email: String!
    instagram: String
    cameras: [String]
    presets: [Preset!]!
    filmSims: [FilmSim!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  extend type Query {
    getUser(id: ID!): User
    getCurrentUser: User
    searchUsers(query: String!): [User]
  }

  extend type Mutation {
    login(email: String!, password: String!): AuthPayload!
    register(username: String!, email: String!, password: String!): AuthPayload!
    updateProfile(input: JSON!): User
    uploadAvatar(file: Upload!): String
  }
`;
