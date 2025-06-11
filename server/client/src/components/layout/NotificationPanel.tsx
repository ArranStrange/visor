import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Badge,
  Drawer,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";

type Notification = {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
};

const mockNotifications: Notification[] = [
  {
    id: "1",
    message: "Arran replied to your comment on “Cinematic Mood”",
    timestamp: "2h ago",
    read: false,
  },
  {
    id: "2",
    message: "“Kodak Ultramax” was updated by Nina",
    timestamp: "5h ago",
    read: true,
  },
  {
    id: "3",
    message: "New follower: streetshooter93",
    timestamp: "1d ago",
    read: false,
  },
];

const NotificationPanel: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <>
      <IconButton onClick={() => setOpen(true)} color="inherit">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ zIndex: 1300 }}
      >
        <Box sx={{ width: 320, p: 2 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontWeight="bold">
              Notifications
            </Typography>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <List>
            {mockNotifications.map((notif) => (
              <React.Fragment key={notif.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    backgroundColor: notif.read
                      ? "inherit"
                      : "rgba(255,255,255,0.04)",
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography fontWeight={notif.read ? "normal" : "bold"}>
                        {notif.message}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {notif.timestamp}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default NotificationPanel;
