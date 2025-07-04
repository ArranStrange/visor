import { gql } from "@apollo/client";

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($userId: ID!, $page: Int, $limit: Int) {
    getNotifications(userId: $userId, page: $page, limit: $limit) {
      notifications {
        id
        type
        title
        message
        isRead
        createdAt
        updatedAt
        recipientId
        senderId
        discussionId
        postId
        linkedItem {
          type
          id
          title
          slug
        }
        sender {
          id
          username
          avatar
        }
        discussion {
          id
          title
        }
        post {
          id
          content
        }
      }
      totalCount
      hasNextPage
      hasPreviousPage
      unreadCount
    }
  }
`;

export const GET_UNREAD_NOTIFICATIONS_COUNT = gql`
  query GetUnreadNotificationsCount($userId: ID!) {
    getUnreadNotificationsCount(userId: $userId)
  }
`;

export const GET_NOTIFICATION_BY_ID = gql`
  query GetNotificationById($id: ID!) {
    getNotificationById(id: $id) {
      id
      type
      title
      message
      isRead
      createdAt
      updatedAt
      recipientId
      senderId
      discussionId
      postId
      linkedItem {
        type
        id
        title
        slug
      }
      sender {
        id
        username
        avatar
      }
      discussion {
        id
        title
      }
      post {
        id
        content
      }
    }
  }
`;
