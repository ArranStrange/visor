const { gql } = require("apollo-server-express");

module.exports = gql`
  type Tag {
    id: ID!
    name: String!
    displayName: String!
    description: String
    category: String!
    relatedTags: [Tag]
    createdBy: User
  }

  extend type Query {
    allTags: [String]
    getTag(name: String!): Tag
    listTags(category: String): [Tag]
    searchTags(search: String, category: String, limit: Int): [Tag]
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
