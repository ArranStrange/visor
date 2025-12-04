import { MenuItem } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

interface NotificationsMenuItemProps {
  onClose: () => void;
  navigate: (path: string) => void;
}

export function NotificationsMenuItem({
  onClose,
  navigate,
}: NotificationsMenuItemProps) {
  return (
    <MenuItem
      onClick={() => {
        onClose();
        navigate("/notifications");
      }}
    >
      <NotificationsIcon />
      Notifications
    </MenuItem>
  );
}
