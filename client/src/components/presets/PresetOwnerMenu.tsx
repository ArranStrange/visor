import React from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface PresetOwnerMenuProps {
  preset?: any;
  isOwner?: boolean;
  menuAnchorEl?: HTMLElement | null;
  menuOpen?: boolean;
  onMenuClose?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

const PresetOwnerMenu: React.FC<PresetOwnerMenuProps> = ({
  isOwner = false,
  menuAnchorEl,
  menuOpen = false,
  onMenuClose,
  onEditClick,
  onDeleteClick,
}) => {
  if (!isOwner) return null;
  return (
    <Menu
      anchorEl={menuAnchorEl || null}
      open={menuOpen}
      onClose={onMenuClose}
      PaperProps={{
        sx: {
          backgroundColor: "background.paper",
          boxShadow: 1,
        },
      }}
    >
      <MenuItem onClick={onEditClick}>
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Edit" />
      </MenuItem>
      <MenuItem onClick={onDeleteClick}>
        <ListItemIcon>
          <DeleteIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText primary="Delete" />
      </MenuItem>
    </Menu>
  );
};

export default PresetOwnerMenu;
