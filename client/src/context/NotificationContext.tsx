import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useAuth } from "./AuthContext";
import {
  GET_UNREAD_NOTIFICATIONS_COUNT,
  GET_NOTIFICATIONS,
} from "../graphql/queries/notifications";
import {
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
} from "../graphql/mutations/notifications";
import { Notification, NotificationConnection } from "../types/notifications";

interface NotificationContextType {
  unreadCount: number;
  notifications: Notification[];
  loading: boolean;
  error: any;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Query for unread count
  const {
    data: unreadData,
    loading: unreadLoading,
    error: unreadError,
    refetch: refetchUnreadCount,
  } = useQuery(GET_UNREAD_NOTIFICATIONS_COUNT, {
    variables: { userId: user?.id },
    skip: !user?.id,
    pollInterval: 30000, // Poll every 30 seconds
  });

  // Query for notifications
  const {
    data: notificationsData,
    loading: notificationsLoading,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useQuery(GET_NOTIFICATIONS, {
    variables: {
      userId: user?.id,
      page: 1,
      limit: 50,
    },
    skip: !user?.id,
  });

  // Mutations
  const [markAsReadMutation] = useMutation(MARK_NOTIFICATION_READ);
  const [markAllAsReadMutation] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

  // Update unread count when data changes
  useEffect(() => {
    if (unreadData?.getUnreadNotificationsCount !== undefined) {
      setUnreadCount(unreadData.getUnreadNotificationsCount);
    }
  }, [unreadData]);

  // Update notifications when data changes
  useEffect(() => {
    if (notificationsData?.getNotifications?.notifications) {
      setNotifications(notificationsData.getNotifications.notifications);
    }
  }, [notificationsData]);

  const markAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation({
        variables: {
          input: { notificationId },
        },
      });

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Refetch unread count
      refetchUnreadCount();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      await markAllAsReadMutation({
        variables: {
          input: { userId: user.id },
        },
      });

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);

      // Refetch data
      refetchNotifications();
      refetchUnreadCount();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const value: NotificationContextType = {
    unreadCount,
    notifications,
    loading: unreadLoading || notificationsLoading,
    error: unreadError || notificationsError,
    markAsRead,
    markAllAsRead,
    refetchNotifications,
    refetchUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
