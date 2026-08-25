import { gql } from "@apollo/client";
import type {
  CreateNotificationInput,
  Notification,
} from "@/features/notifications/types/notifications";

export interface CreateNotificationMutationData {
  createNotification: Notification | null;
}

export interface CreateNotificationMutationVariables {
  input: CreateNotificationInput;
}

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
          content
          userId
          username
          timestamp
          isEdited
          editedAt
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
        content
        userId
        username
        timestamp
        isEdited
        editedAt
      }
    }
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($input: MarkNotificationReadInput!) {
    markNotificationRead(input: $input) {
      id
      isRead
      updatedAt
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead($input: MarkAllNotificationsReadInput!) {
    markAllNotificationsRead(input: $input) {
      success
      updatedCount
    }
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($input: DeleteNotificationInput!) {
    deleteNotification(input: $input) {
      success
      deletedId
    }
  }
`;

export const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($input: CreateNotificationInput!) {
    createNotification(input: $input) {
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
    }
  }
`;
