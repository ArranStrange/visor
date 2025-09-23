import React, { useState } from "react";
import {
  IconButton,
  Badge,
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Drawer,
  Slide,
  Fade,
  Backdrop,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  Reply as ReplyIcon,
  ThumbUp as LikeIcon,
  AlternateEmail as MentionIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import { Notification, NotificationType } from "../../types/notifications";

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { unreadCount, notifications, loading, markAsRead, markAllAsRead } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);

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
        onClick={handleOpen}
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

      <Drawer
        anchor="right"
        open={isOpen}
        onClose={handleClose}
        sx={{
          "& .MuiDrawer-paper": {
            width: "33.333%",
            minWidth: 350,
            maxWidth: 450,
            height: "100vh",
            boxShadow: "-4px 0 20px rgba(0, 0, 0, 0.15)",
            border: "none",
            borderRadius: 0,
          },
        }}
        transitionDuration={300}
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.paper",
          }}
        >
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
              <Box display="flex" alignItems="center" gap={1}>
                {unreadCount > 0 && (
                  <Button
                    size="small"
                    onClick={handleMarkAllAsRead}
                    disabled={loading}
                  >
                    Mark all read
                  </Button>
                )}
                <IconButton onClick={handleClose} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {unreadCount} unread • {notifications.length} total
            </Typography>
          </Box>

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
                <Box
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    py: 2,
                    px: 2,
                    cursor: "pointer",
                    backgroundColor: notification.isRead
                      ? "transparent"
                      : "action.hover",
                    borderRadius: 1,
                    mb: 1,
                    "&:hover": {
                      backgroundColor: "action.selected",
                    },
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
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
                        mb: 0.5,
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
                        mb: 0.5,
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
                </Box>
              ))
            )}
          </Box>

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
      </Drawer>
    </>
  );
};

export default NotificationBell;
