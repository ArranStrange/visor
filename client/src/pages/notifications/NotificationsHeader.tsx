import React from "react";
import { Box, Typography, Button } from "@mui/material";
import MarkReadIcon from "@mui/icons-material/MarkEmailRead";

interface NotificationsHeaderProps {
  unreadCount: number;
  totalCount: number;
  onMarkAllAsRead: () => void;
}

const NotificationsHeader: React.FC<NotificationsHeaderProps> = ({
  unreadCount,
  totalCount,
  onMarkAllAsRead,
}) => (
  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Notifications
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {unreadCount} unread • {totalCount} total
      </Typography>
    </Box>
    {unreadCount > 0 && (
      <Button variant="outlined" startIcon={<MarkReadIcon />} onClick={onMarkAllAsRead}>
        Mark all as read
      </Button>
    )}
  </Box>
);

export default NotificationsHeader;
