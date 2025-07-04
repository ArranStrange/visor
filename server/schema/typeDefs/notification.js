const { gql } = require("apollo-server-express");

const notificationTypeDefs = gql`
  enum NotificationType {
    DISCUSSION_REPLY
    DISCUSSION_OWNER_REPLY
    MENTION
    FOLLOW
    LIKE
    INFO
  }

  type LinkedItem {
    type: String!
    id: ID!
    title: String!
    slug: String
  }

  type Notification {
    id: ID!
    type: NotificationType!
    title: String!
    message: String!
    isRead: Boolean!
    createdAt: String!
    updatedAt: String!
    recipientId: ID!
    senderId: ID
    discussionId: ID
    postId: ID
    linkedItem: LinkedItem
    sender: User
    discussion: Discussion
    post: DiscussionPost
  }

  type NotificationConnection {
    notifications: [Notification!]!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    unreadCount: Int!
  }

  input CreateNotificationInput {
    type: NotificationType!
    title: String!
    message: String!
    recipientId: ID!
    senderId: ID
    discussionId: ID
    postId: ID
    linkedItem: LinkedItemInput
  }

  input LinkedItemInput {
    type: String!
    id: ID!
    title: String!
    slug: String
  }

  input MarkNotificationReadInput {
    notificationId: ID!
  }

  input MarkAllNotificationsReadInput {
    userId: ID!
  }

  input DeleteNotificationInput {
    notificationId: ID!
  }

  extend type Query {
    getNotifications(
      userId: ID!
      page: Int
      limit: Int
    ): NotificationConnection!
    getUnreadNotificationsCount(userId: ID!): Int!
    getNotificationById(id: ID!): Notification
  }

  extend type Mutation {
    markNotificationRead(input: MarkNotificationReadInput!): Notification!
    markAllNotificationsRead(
      input: MarkAllNotificationsReadInput!
    ): MarkAllNotificationsReadResponse!
    deleteNotification(
      input: DeleteNotificationInput!
    ): DeleteNotificationResponse!
    createNotification(input: CreateNotificationInput!): Notification!
  }

  type MarkAllNotificationsReadResponse {
    success: Boolean!
    updatedCount: Int!
  }

  type DeleteNotificationResponse {
    success: Boolean!
    deletedId: ID!
  }
`;

module.exports = notificationTypeDefs;
