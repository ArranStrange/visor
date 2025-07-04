export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  recipientId: string;
  senderId?: string;
  discussionId?: string;
  postId?: string;
  linkedItem?: {
    type: string;
    id: string;
    title: string;
    slug?: string;
  };
}

export enum NotificationType {
  DISCUSSION_REPLY = "DISCUSSION_REPLY",
  DISCUSSION_OWNER_REPLY = "DISCUSSION_OWNER_REPLY",
  MENTION = "MENTION",
  FOLLOW = "FOLLOW",
  LIKE = "LIKE",
}

export interface NotificationConnection {
  notifications: Notification[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  unreadCount: number;
}

export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  recipientId: string;
  senderId?: string;
  discussionId?: string;
  postId?: string;
  linkedItem?: {
    type: string;
    id: string;
    title: string;
    slug?: string;
  };
}

export interface MarkNotificationReadInput {
  notificationId: string;
}

export interface MarkAllNotificationsReadInput {
  userId: string;
}

export interface DeleteNotificationInput {
  notificationId: string;
}
