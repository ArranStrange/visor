import { MenuItem } from "@mui/material";
import ListIcon from "@mui/icons-material/List";

interface MyListsMenuItemProps {
  onClose: () => void;
  navigate: (path: string) => void;
}

export function MyListsMenuItem({ onClose, navigate }: MyListsMenuItemProps) {
  return (
    <MenuItem
      onClick={() => {
        onClose();
        navigate("/lists");
      }}
    >
      <ListIcon />
      My Lists
    </MenuItem>
  );
}
