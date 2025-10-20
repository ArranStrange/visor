const { gql } = require("apollo-server-express");

module.exports = gql`
  extend type Query {
    getImage(id: ID!): Image
    listImagesByPreset(presetId: ID!): [Image!]!
    getFeaturedPhoto: Image
  }

  extend type Mutation {
    makeFeaturedPhoto(imageId: ID!): Image
    removeFeaturedPhoto(imageId: ID!): Image
  }
`;
