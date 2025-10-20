const { gql } = require("apollo-server-express");

module.exports = gql`
  type Discussion {
    id: ID!
    title: String!
    linkedTo: DiscussionTarget!
    createdBy: User!
    followers: [User!]!
    posts: [DiscussionPost!]!
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
    userId: ID!
    username: String!
    avatar: String
    content: String!
    timestamp: String!
    isEdited: Boolean!
    editedAt: String
    replies: [DiscussionReply!]!
  }

  type DiscussionReply {
    userId: ID!
    username: String!
    avatar: String
    content: String!
    timestamp: String!
    isEdited: Boolean!
    editedAt: String
  }

  type DiscussionConnection {
    discussions: [Discussion!]!
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
    discussionId: ID!
    content: String!
  }

  input UpdatePostInput {
    discussionId: ID!
    postIndex: Int!
    content: String!
  }

  input CreateReplyInput {
    discussionId: ID!
    postIndex: Int!
    content: String!
  }

  input UpdateReplyInput {
    discussionId: ID!
    postIndex: Int!
    replyIndex: Int!
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

    # Search
    searchDiscussions(
      query: String!
      page: Int
      limit: Int
    ): DiscussionConnection!

    # User activity
    getFollowedDiscussions(
      userId: ID!
      page: Int
      limit: Int
    ): DiscussionConnection!
    getRecentDiscussions(limit: Int): [Discussion!]!
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
    updatePost(input: UpdatePostInput!): DiscussionPost!
    deletePost(discussionId: ID!, postIndex: Int!): Boolean!

    # Reply mutations
    createReply(input: CreateReplyInput!): DiscussionReply!
    updateReply(input: UpdateReplyInput!): DiscussionReply!
    deleteReply(discussionId: ID!, postIndex: Int!, replyIndex: Int!): Boolean!
  }
`;
