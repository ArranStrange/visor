const { gql } = require("apollo-server-express");

module.exports = gql`
  extend type Query {
    getImage(id: ID!): Image
    listImagesByPreset(presetId: ID!): [Image!]!
  }
`;
