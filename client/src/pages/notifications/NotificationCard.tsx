import React from "react";
import {
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { formatDistanceToNow } from "date-fns";
import { Notification } from "@/features/notifications/types/notifications";
import {
  getNotificationIcon,
  getNotificationColor,
  getTypeLabel,
} from "./notificationDisplay";

interface NotificationCardProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
  onMenuOpen: (
    event: React.MouseEvent<HTMLElement>,
    notification: Notification
  ) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onClick,
  onMenuOpen,
}) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: getNotificationColor(notification.type),
              color: "white",
            }}
          >
            {getNotificationIcon(notification.type)}
          </Avatar>

          <Box flex={1} minWidth={0}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              mb={1}
            >
              <Box flex={1}>
                <Typography
                  variant="h6"
                  fontWeight={notification.isRead ? "normal" : "bold"}
                  sx={{ cursor: "pointer" }}
                  onClick={handleClick}
                >
                  {notification.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {notification.message}
                </Typography>
              </Box>
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
            </Box>

            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Chip
                label={getTypeLabel(notification.type)}
                size="small"
                variant="outlined"
                color={notification.isRead ? "default" : "primary"}
              />
              {!notification.isRead && (
                <Chip label="Unread" size="small" color="primary" variant="filled" />
              )}
            </Box>

            <Typography variant="caption" color="text.secondary">
              {formatCreatedAt(notification.createdAt)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  function handleClick() {
    onClick(notification);
  }

  function handleMenuOpen(event: React.MouseEvent<HTMLElement>) {
    onMenuOpen(event, notification);
  }
};

function formatCreatedAt(createdAt: string): string {
  try {
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) {
      return "Recently";
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "Recently";
  }
}

export default NotificationCard;
