import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

interface EmptyNotificationsStateProps {
  filter: "all" | "unread" | "read";
}

const EmptyNotificationsState: React.FC<EmptyNotificationsStateProps> = ({
  filter,
}) => (
  <Card>
    <CardContent sx={{ textAlign: "center", py: 6 }}>
      <NotificationsIcon
        sx={{ typography: "display", color: "text.secondary", mb: 2 }}
      />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No notifications found
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {getEmptyMessage(filter)}
      </Typography>
    </CardContent>
  </Card>
);

function getEmptyMessage(filter: "all" | "unread" | "read"): string {
  switch (filter) {
    case "unread":
      return "You have no unread notifications";
    case "read":
      return "You have no read notifications";
    default:
      return "You have no notifications yet";
  }
}

export default EmptyNotificationsState;
