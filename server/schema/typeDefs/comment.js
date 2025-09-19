const { gql } = require("apollo-server-express");

module.exports = gql`
  extend type Query {
    getCommentsForPreset(presetId: ID!): [Comment!]!
    getCommentsForFilmSim(filmSimId: ID!): [Comment!]!
  }

  extend type Mutation {
    createComment(input: CreateCommentInput!): Comment!
    reactToComment(commentId: ID!, reaction: String!): Comment!
    deleteComment(id: ID!): Boolean!
  }
`;
