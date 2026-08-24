import { ApolloCache } from "@apollo/client";
import {
  GET_NOTIFICATIONS,
  GET_UNREAD_NOTIFICATIONS_COUNT,
} from "../graphql/notifications";
import { NotificationConnection } from "../types/notifications";

export const NOTIFICATIONS_PAGE = 1;
export const NOTIFICATIONS_LIMIT = 50;

export interface NotificationsQueryData {
  getNotifications?: NotificationConnection | null;
}

export interface NotificationsQueryVariables {
  userId: string;
  page: number;
  limit: number;
}

export interface UnreadNotificationsQueryData {
  getUnreadNotificationsCount: number;
}

export interface UnreadNotificationsQueryVariables {
  userId: string;
}

export function markNotificationReadInCache(
  cache: ApolloCache<unknown>,
  userId: string,
  notificationId: string
) {
  cache.updateQuery<NotificationsQueryData, NotificationsQueryVariables>(
    {
      query: GET_NOTIFICATIONS,
      variables: {
        userId,
        page: NOTIFICATIONS_PAGE,
        limit: NOTIFICATIONS_LIMIT,
      },
    },
    (data) => {
      if (!data?.getNotifications) return data;

      return {
        getNotifications: {
          ...data.getNotifications,
          notifications: data.getNotifications.notifications.map(
            (notification) =>
              notification.id === notificationId
                ? { ...notification, isRead: true }
                : notification
          ),
        },
      };
    }
  );
}

export function markAllNotificationsReadInCache(
  cache: ApolloCache<unknown>,
  userId: string
) {
  cache.updateQuery<NotificationsQueryData, NotificationsQueryVariables>(
    {
      query: GET_NOTIFICATIONS,
      variables: {
        userId,
        page: NOTIFICATIONS_PAGE,
        limit: NOTIFICATIONS_LIMIT,
      },
    },
    (data) => {
      if (!data?.getNotifications) return data;

      return {
        getNotifications: {
          ...data.getNotifications,
          notifications: data.getNotifications.notifications.map(
            (notification) => ({ ...notification, isRead: true })
          ),
        },
      };
    }
  );
  cache.writeQuery<
    UnreadNotificationsQueryData,
    UnreadNotificationsQueryVariables
  >({
    query: GET_UNREAD_NOTIFICATIONS_COUNT,
    variables: { userId },
    data: { getUnreadNotificationsCount: 0 },
  });
}
