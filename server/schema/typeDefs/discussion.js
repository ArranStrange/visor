const { gql } = require("apollo-server-express");

module.exports = gql`
  type Discussion {
    id: ID!
    title: String!
    linkedTo: DiscussionTarget!
    createdBy: User!
    followers: [User!]!
    postCount: Int!
    lastActivity: String!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type DiscussionTarget {
    type: DiscussionTargetType!
    refId: ID!
    preset: Preset
    filmSim: FilmSim
  }

  type DiscussionPost {
    id: ID!
    discussionId: ID!
    parentId: ID
    parent: DiscussionPost
    author: User!
    content: String!
    isEdited: Boolean!
    editedAt: String
    isDeleted: Boolean!
    deletedAt: String
    deletedBy: User
    createdAt: String!
    updatedAt: String!
  }

  type DiscussionConnection {
    discussions: [Discussion!]!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type PostConnection {
    posts: [DiscussionPost!]!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  enum DiscussionTargetType {
    PRESET
    FILMSIM
  }

  input CreateDiscussionInput {
    title: String!
    linkedToType: DiscussionTargetType!
    linkedToId: ID!
  }

  input UpdateDiscussionInput {
    title: String
    isActive: Boolean
  }

  input CreatePostInput {
    discussionId: ID
    parentId: ID
    content: String!
    linkedToType: DiscussionTargetType
    linkedToId: ID
  }

  input UpdatePostInput {
    content: String!
  }

  extend type Query {
    # Discussion queries
    getDiscussions(
      page: Int
      limit: Int
      type: DiscussionTargetType
      search: String
      createdBy: ID
    ): DiscussionConnection!

    getDiscussion(id: ID!): Discussion
    getDiscussionByLinkedItem(
      type: DiscussionTargetType!
      refId: ID!
    ): Discussion

    # Post queries
    getPosts(
      discussionId: ID!
      page: Int
      limit: Int
      parentId: ID
    ): PostConnection!

    getPost(id: ID!): DiscussionPost
    getPostsByAuthor(authorId: ID!, page: Int, limit: Int): PostConnection!

    # Search
    searchDiscussions(
      query: String!
      page: Int
      limit: Int
    ): DiscussionConnection!
    searchPosts(query: String!, page: Int, limit: Int): PostConnection!

    # User activity
    getFollowedDiscussions(
      userId: ID!
      page: Int
      limit: Int
    ): DiscussionConnection!
    getRecentDiscussions(limit: Int): [Discussion!]!
    getRecentPosts(limit: Int): [DiscussionPost!]!
  }

  extend type Mutation {
    # Discussion mutations
    createDiscussion(input: CreateDiscussionInput!): Discussion!
    updateDiscussion(id: ID!, input: UpdateDiscussionInput!): Discussion!
    deleteDiscussion(id: ID!): Boolean!

    # Following
    followDiscussion(discussionId: ID!): Discussion!
    unfollowDiscussion(discussionId: ID!): Discussion!

    # Post mutations
    createPost(input: CreatePostInput!): DiscussionPost!
    updatePost(id: ID!, input: UpdatePostInput!): DiscussionPost!
    deletePost(id: ID!): Boolean!
  }
`;
