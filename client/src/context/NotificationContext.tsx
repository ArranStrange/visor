import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useAuth } from "./AuthContext";
import {
  GET_UNREAD_NOTIFICATIONS_COUNT,
  GET_NOTIFICATIONS,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
} from "@/features/notifications/graphql/notifications";
import { Notification } from "@/features/notifications/types/notifications";
import {
  markAllNotificationsReadInCache,
  markNotificationReadInCache,
  NOTIFICATIONS_LIMIT,
  NOTIFICATIONS_PAGE,
  NotificationsQueryData,
  NotificationsQueryVariables,
  UnreadNotificationsQueryData,
  UnreadNotificationsQueryVariables,
} from "./notification-cache";

const POLL_INTERVAL = 30000;

interface NotificationContextType {
  unreadCount: number;
  notifications: Notification[];
  loading: boolean;
  error: Error | undefined;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetchNotifications: () => void;
  refetchUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const userId = user?.id;

  // Query for unread count
  const {
    data: unreadData,
    loading: unreadLoading,
    error: unreadError,
    refetch: refetchUnreadCountQuery,
    startPolling,
    stopPolling,
  } = useQuery<UnreadNotificationsQueryData, UnreadNotificationsQueryVariables>(
    GET_UNREAD_NOTIFICATIONS_COUNT,
    {
      variables: { userId: userId ?? "" },
      skip: !userId,
    }
  );

  // Query for notifications
  const {
    data: notificationsData,
    loading: notificationsLoading,
    error: notificationsError,
    refetch: refetchNotificationsQuery,
  } = useQuery<NotificationsQueryData, NotificationsQueryVariables>(
    GET_NOTIFICATIONS,
    {
      variables: {
        userId: userId ?? "",
        page: NOTIFICATIONS_PAGE,
        limit: NOTIFICATIONS_LIMIT,
      },
      skip: !userId,
    }
  );

  // Mutations
  const [markAsReadMutation] = useMutation(MARK_NOTIFICATION_READ);
  const [markAllAsReadMutation] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

  const unreadCount = useMemo(
    () => unreadData?.getUnreadNotificationsCount ?? 0,
    [unreadData?.getUnreadNotificationsCount]
  );
  const notifications = useMemo(
    () => notificationsData?.getNotifications?.notifications ?? [],
    [notificationsData?.getNotifications?.notifications]
  );

  const handleVisibilityChange = useCallback(
    function handleVisibilityChange() {
      if (document.hidden) {
        stopPolling();
        return;
      }

      startPolling(POLL_INTERVAL);
    },
    [startPolling, stopPolling]
  );

  useEffect(
    function managePolling() {
      if (!userId) return;

      handleVisibilityChange();
      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        stopPolling();
      };
    },
    [handleVisibilityChange, stopPolling, userId]
  );

  const refetchNotifications = useCallback(
    function refetchNotifications() {
      void refetchNotificationsQuery().catch((error) => {
        console.error("Error refetching notifications:", error);
      });
    },
    [refetchNotificationsQuery]
  );

  const refetchUnreadCount = useCallback(
    function refetchUnreadCount() {
      void refetchUnreadCountQuery().catch((error) => {
        console.error("Error refetching unread notification count:", error);
      });
    },
    [refetchUnreadCountQuery]
  );

  const markAsRead = useCallback(
    async function markAsRead(notificationId: string) {
      try {
        await markAsReadMutation({
          variables: {
            input: { notificationId },
          },
          update(cache) {
            if (userId) {
              markNotificationReadInCache(cache, userId, notificationId);
            }
          },
        });

        // Refetch unread count
        refetchUnreadCount();
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },
    [markAsReadMutation, refetchUnreadCount, userId]
  );

  const markAllAsRead = useCallback(
    async function markAllAsRead() {
      if (!userId) return;

      try {
        await markAllAsReadMutation({
          variables: {
            input: { userId },
          },
          update(cache) {
            markAllNotificationsReadInCache(cache, userId);
          },
        });

        // Refetch data
        refetchNotifications();
        refetchUnreadCount();
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
      }
    },
    [markAllAsReadMutation, refetchNotifications, refetchUnreadCount, userId]
  );

  const value = useMemo<NotificationContextType>(
    () => ({
      unreadCount,
      notifications,
      loading: unreadLoading || notificationsLoading,
      error: unreadError || notificationsError,
      markAsRead,
      markAllAsRead,
      refetchNotifications,
      refetchUnreadCount,
    }),
    [
      unreadCount,
      notifications,
      unreadLoading,
      notificationsLoading,
      unreadError,
      notificationsError,
      markAsRead,
      markAllAsRead,
      refetchNotifications,
      refetchUnreadCount,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
