import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Pagination,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  Reply as ReplyIcon,
  ThumbUp as LikeIcon,
  AlternateEmail as MentionIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { useAuth } from "context/AuthContext";
import { useNotifications } from "context/NotificationContext";
import { GET_NOTIFICATIONS } from "@gql/queries/notifications";
import { DELETE_NOTIFICATION } from "@gql/mutations/notifications";
import { Notification, NotificationType } from "types/notifications";

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { markAsRead, markAllAsRead, refetchNotifications } =
    useNotifications();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const { data, loading, error } = useQuery(GET_NOTIFICATIONS, {
    variables: {
      userId: user?.id,
      page,
      limit: 20,
    },
    skip: !user?.id,
  });

  const [deleteNotification] = useMutation(DELETE_NOTIFICATION);

  const notifications = data?.getNotifications?.notifications || [];
  const totalCount = data?.getNotifications?.totalCount || 0;
  const unreadCount = data?.getNotifications?.unreadCount || 0;

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    notification: Notification
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedNotification) return;

    try {
      await deleteNotification({
        variables: {
          input: { notificationId: selectedNotification.id },
        },
      });
      refetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
    handleMenuClose();
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

  const getTypeLabel = (type: NotificationType) => {
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
  };

  const filteredNotifications = notifications.filter(
    (notification: Notification) => {
      if (filter === "unread" && notification.isRead) return false;
      if (filter === "read" && !notification.isRead) return false;
      if (typeFilter !== "all" && notification.type !== typeFilter)
        return false;
      return true;
    }
  );

  const totalPages = Math.ceil(totalCount / 20);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box py={4} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Alert severity="error">
            Error loading notifications: {error.message}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {unreadCount} unread • {totalCount} total
            </Typography>
          </Box>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              startIcon={<MarkReadIcon />}
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              gap={2}
            >
              <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filter}
                  onChange={(e) =>
                    setFilter(e.target.value as "all" | "unread" | "read")
                  }
                  label="Status"
                >
                  <MenuItem value="all">All notifications</MenuItem>
                  <MenuItem value="unread">Unread only</MenuItem>
                  <MenuItem value="read">Read only</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) =>
                    setTypeFilter(e.target.value as NotificationType | "all")
                  }
                  label="Type"
                >
                  <MenuItem value="all">All types</MenuItem>
                  <MenuItem value={NotificationType.DISCUSSION_REPLY}>
                    Replies
                  </MenuItem>
                  <MenuItem value={NotificationType.DISCUSSION_OWNER_REPLY}>
                    Owner replies
                  </MenuItem>
                  <MenuItem value={NotificationType.MENTION}>Mentions</MenuItem>
                  <MenuItem value={NotificationType.FOLLOW}>Follows</MenuItem>
                  <MenuItem value={NotificationType.LIKE}>Likes</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <NotificationsIcon
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No notifications found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filter === "unread"
                  ? "You have no unread notifications"
                  : filter === "read"
                  ? "You have no read notifications"
                  : "You have no notifications yet"}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box>
            {filteredNotifications.map((notification: Notification) => (
              <Card key={notification.id} sx={{ mb: 2 }}>
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
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                          >
                            {notification.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={1}
                          >
                            {notification.message}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, notification)}
                        >
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
                          <Chip
                            label="Unread"
                            size="small"
                            color="primary"
                            variant="filled"
                          />
                        )}
                      </Box>

                      <Typography variant="caption" color="text.secondary">
                        {(() => {
                          try {
                            const date = new Date(notification.createdAt);
                            if (isNaN(date.getTime())) {
                              return "Recently";
                            }
                            return formatDistanceToNow(date, {
                              addSuffix: true,
                            });
                          } catch (error) {
                            return "Recently";
                          }
                        })()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.isRead && (
          <MenuItem onClick={() => handleMarkAsRead(selectedNotification.id)}>
            <MarkReadIcon sx={{ mr: 1 }} />
            Mark as read
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Notifications;
