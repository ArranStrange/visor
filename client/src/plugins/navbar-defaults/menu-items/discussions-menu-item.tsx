import { MenuItem } from "@mui/material";
import ForumIcon from "@mui/icons-material/Forum";

interface DiscussionsMenuItemProps {
  onClose: () => void;
  navigate: (path: string) => void;
}

export function DiscussionsMenuItem({
  onClose,
  navigate,
}: DiscussionsMenuItemProps) {
  return (
    <MenuItem
      onClick={() => {
        onClose();
        navigate("/discussions");
      }}
    >
      <ForumIcon />
      Discussions
    </MenuItem>
  );
}
