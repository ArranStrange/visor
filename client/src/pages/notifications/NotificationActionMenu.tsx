import React from "react";
import { Menu, MenuItem } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import MarkReadIcon from "@mui/icons-material/MarkEmailRead";
import { Notification } from "../../types/notifications";

interface NotificationActionMenuProps {
  anchorEl: HTMLElement | null;
  selectedNotification: Notification | null;
  onClose: () => void;
  onMarkAsRead: (notificationId: string) => void;
  onDelete: () => void;
}

const NotificationActionMenu: React.FC<NotificationActionMenuProps> = ({
  anchorEl,
  selectedNotification,
  onClose,
  onMarkAsRead,
  onDelete,
}) => {
  return (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
      {selectedNotification && !selectedNotification.isRead && (
        <MenuItem onClick={handleMarkAsRead}>
          <MarkReadIcon sx={{ mr: 1 }} />
          Mark as read
        </MenuItem>
      )}
      <MenuItem onClick={onDelete}>
        <DeleteIcon sx={{ mr: 1 }} />
        Delete
      </MenuItem>
    </Menu>
  );

  function handleMarkAsRead() {
    if (selectedNotification) {
      onMarkAsRead(selectedNotification.id);
    }
  }
};

export default NotificationActionMenu;
