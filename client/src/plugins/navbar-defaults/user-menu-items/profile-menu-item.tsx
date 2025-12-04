import { MenuItem, Divider } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

interface ProfileMenuItemProps {
  user: {
    id?: string;
    username?: string;
  };
  onClose: () => void;
  navigate: (path: string) => void;
}

export function ProfileMenuItem({
  user,
  onClose,
  navigate,
}: ProfileMenuItemProps) {
  return (
    <>
      <MenuItem
        onClick={() => {
          onClose();
          navigate(`/profile/${user?.id}`);
        }}
      >
        <AccountCircleIcon />
        Profile
      </MenuItem>
      <Divider />
    </>
  );
}
