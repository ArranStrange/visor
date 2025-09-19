const { gql } = require("apollo-server-express");

module.exports = gql`
  scalar Upload
  scalar JSON
  scalar ObjectId
  scalar StringOrInt

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;
