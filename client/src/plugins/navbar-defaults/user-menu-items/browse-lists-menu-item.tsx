import { MenuItem, Divider } from "@mui/material";
import ListIcon from "@mui/icons-material/List";

interface BrowseListsMenuItemProps {
  onClose: () => void;
  navigate: (path: string) => void;
}

export function BrowseListsMenuItem({
  onClose,
  navigate,
}: BrowseListsMenuItemProps) {
  return (
    <>
      <MenuItem
        onClick={() => {
          onClose();
          navigate("/browse-lists");
        }}
      >
        <ListIcon />
        Browse Lists
      </MenuItem>
      <Divider />
    </>
  );
}
