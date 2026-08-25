import React from "react";
import ChatIcon from "@mui/icons-material/Chat";
import PersonIcon from "@mui/icons-material/Person";
import ReplyIcon from "@mui/icons-material/Reply";
import LikeIcon from "@mui/icons-material/ThumbUp";
import MentionIcon from "@mui/icons-material/AlternateEmail";
import { NotificationType } from "../../types/notifications";

export function getNotificationIcon(
  type: NotificationType
): React.ReactElement {
  switch (type) {
    case NotificationType.DISCUSSION_REPLY:
    case NotificationType.DISCUSSION_OWNER_REPLY:
      return <ReplyIcon fontSize="small" />;
    case NotificationType.MENTION:
      return <MentionIcon fontSize="small" />;
    case NotificationType.FOLLOW:
      return <PersonIcon fontSize="small" />;
    case NotificationType.LIKE:
      return <LikeIcon fontSize="small" />;
    default:
      return <ChatIcon fontSize="small" />;
  }
}

export function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case NotificationType.DISCUSSION_REPLY:
    case NotificationType.DISCUSSION_OWNER_REPLY:
      return "primary.main";
    case NotificationType.MENTION:
      return "warning.main";
    case NotificationType.FOLLOW:
      return "info.main";
    case NotificationType.LIKE:
      return "success.main";
    default:
      return "text.secondary";
  }
}

export function getTypeLabel(type: NotificationType): string {
  switch (type) {
    case NotificationType.DISCUSSION_REPLY:
      return "Reply";
    case NotificationType.DISCUSSION_OWNER_REPLY:
      return "Owner Reply";
    case NotificationType.MENTION:
      return "Mention";
    case NotificationType.FOLLOW:
      return "Follow";
    case NotificationType.LIKE:
      return "Like";
    default:
      return type;
  }
}
