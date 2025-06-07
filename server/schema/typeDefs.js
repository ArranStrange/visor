const { gql } = require("apollo-server-express");

module.exports = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    avatar: String
    bio: String
    cameras: [String]
    instagram: String
  }

  type Query {
    currentUser: User
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): String
  }
`;
