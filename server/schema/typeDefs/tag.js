const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Tag {
    id: ID!
    name: String!
    displayName: String
    description: String
    category: String!
    relatedTags: [Tag]
    createdBy: User
  }

  extend type Query {
    getTags: [Tag!]!
    getTag(id: ID!): Tag
    listTags(category: String): [Tag]
  }

  extend type Mutation {
    createTag(input: CreateTagInput!): Tag
    updateTag(id: ID!, input: UpdateTagInput!): Tag
    deleteTag(id: ID!): Boolean
  }

  input CreateTagInput {
    name: String!
    displayName: String!
    description: String
    category: String!
    relatedTagIds: [ID!]
  }

  input UpdateTagInput {
    displayName: String
    description: String
    category: String
    relatedTagIds: [ID!]
  }
`;

module.exports = typeDefs;
