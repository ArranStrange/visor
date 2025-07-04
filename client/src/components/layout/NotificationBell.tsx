import React, { useState } from "react";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Avatar,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  Reply as ReplyIcon,
  ThumbUp as LikeIcon,
  AlternateEmail as MentionIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import { Notification, NotificationType } from "../../types/notifications";

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { unreadCount, notifications, loading, markAsRead, markAllAsRead } =
    useNotifications();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    await markAsRead(notification.id);

    // Navigate based on notification type
    if (notification.discussionId) {
      navigate(`/discussions/${notification.discussionId}`);
    } else if (notification.linkedItem?.slug) {
      const path =
        notification.linkedItem.type === "PRESET"
          ? `/preset/${notification.linkedItem.slug}`
          : `/filmsim/${notification.linkedItem.slug}`;
      navigate(path);
    }

    handleClose();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    handleClose();
  };

  const getNotificationIcon = (type: NotificationType) => {
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
  };

  const getNotificationColor = (type: NotificationType) => {
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
  };

  const recentNotifications = notifications.slice(0, 10);

  return (
    <>
      <IconButton
        onClick={handleClick}
        color="inherit"
        sx={{ position: "relative" }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          max={99}
          invisible={unreadCount === 0}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 8,
          sx: {
            width: "33.333%",
            minWidth: 350,
            maxWidth: 450,
            height: "calc(100vh - 32px)",
            maxHeight: "calc(100vh - 32px)",
            overflow: "hidden",
            borderRadius: 0,
            borderLeft: "1px solid",
            borderColor: "divider",
            position: "fixed",
            top: 16,
            right: 0,
            transform: "none !important",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
        sx={{
          "& .MuiPaper-root": {
            left: "auto !important",
            right: "0 !important",
            top: "0 !important",
            height: "100vh !important",
            width: "33.333% !important",
            minWidth: "350px !important",
            maxWidth: "450px !important",
          },
        }}
      >
        <Box
          sx={{
            height: "calc(100vh - 32px)",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.paper",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 3,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              position: "sticky",
              top: 0,
              zIndex: 1,
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5" fontWeight="bold">
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                >
                  Mark all read
                </Button>
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {unreadCount} unread • {notifications.length} total
            </Typography>
          </Box>

          {/* Content */}
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              p: 2,
            }}
          >
            {loading ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            ) : recentNotifications.length === 0 ? (
              <Box textAlign="center" py={3}>
                <NotificationsIcon
                  sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  No notifications yet
                </Typography>
              </Box>
            ) : (
              recentNotifications.map((notification) => (
                <MenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                    py: 1.5,
                    px: 2,
                    backgroundColor: notification.isRead
                      ? "transparent"
                      : "action.hover",
                    "&:hover": {
                      backgroundColor: "action.selected",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: getNotificationColor(notification.type),
                      color: "white",
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Avatar>

                  <Box flex={1} minWidth={0}>
                    <Typography
                      variant="body2"
                      fontWeight={notification.isRead ? "normal" : "bold"}
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {notification.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                      }}
                    >
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(() => {
                        try {
                          const date = new Date(notification.createdAt);
                          if (isNaN(date.getTime())) {
                            return "Recently";
                          }
                          return formatDistanceToNow(date, { addSuffix: true });
                        } catch (error) {
                          return "Recently";
                        }
                      })()}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Box>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <Box
              sx={{
                p: 2,
                borderTop: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Button
                fullWidth
                onClick={() => {
                  navigate("/notifications");
                  handleClose();
                }}
                size="small"
              >
                View all notifications
              </Button>
            </Box>
          )}
        </Box>
      </Menu>
    </>
  );
};

export default NotificationBell;
