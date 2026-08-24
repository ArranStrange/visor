import React, { useState } from "react";
import {
  Container,
  Box,
  CircularProgress,
  Alert,
  Pagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import {
  GET_NOTIFICATIONS,
  DELETE_NOTIFICATION,
} from "../../graphql/notifications";
import { Notification, NotificationType } from "../../types/notifications";
import NotificationsHeader from "./NotificationsHeader";
import NotificationFilters from "./NotificationFilters";
import NotificationCard from "./NotificationCard";
import EmptyNotificationsState from "./EmptyNotificationsState";
import NotificationActionMenu from "./NotificationActionMenu";

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { markAsRead, markAllAsRead, refetchNotifications } =
    useNotifications();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">(
    "all"
  );
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

  if (loading && !data) {
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
        <NotificationsHeader
          unreadCount={unreadCount}
          totalCount={totalCount}
          onMarkAllAsRead={markAllAsRead}
        />

        <NotificationFilters
          filter={filter}
          typeFilter={typeFilter}
          onFilterChange={setFilter}
          onTypeFilterChange={setTypeFilter}
        />

        {filteredNotifications.length === 0 ? (
          <EmptyNotificationsState filter={filter} />
        ) : (
          <Box>
            {filteredNotifications.map((notification: Notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
                onMenuOpen={handleMenuOpen}
              />
            ))}
          </Box>
        )}

        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Box>

      <NotificationActionMenu
        anchorEl={anchorEl}
        selectedNotification={selectedNotification}
        onClose={handleMenuClose}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
      />
    </Container>
  );

  function handlePageChange(_event: React.ChangeEvent<unknown>, value: number) {
    setPage(value);
  }

  function handleMenuOpen(
    event: React.MouseEvent<HTMLElement>,
    notification: Notification
  ) {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  }

  function handleMenuClose() {
    setAnchorEl(null);
    setSelectedNotification(null);
  }

  async function handleMarkAsRead(notificationId: string) {
    await markAsRead(notificationId);
    handleMenuClose();
  }

  async function handleDelete() {
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
  }

  async function handleNotificationClick(notification: Notification) {
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
  }
};

export default Notifications;
