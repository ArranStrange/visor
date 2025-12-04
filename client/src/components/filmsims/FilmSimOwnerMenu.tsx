import React from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface FilmSimOwnerMenuProps {
  filmSim?: any;
  isOwner?: boolean;
  menuAnchorEl?: HTMLElement | null;
  menuOpen?: boolean;
  onMenuClose?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

const FilmSimOwnerMenu: React.FC<FilmSimOwnerMenuProps> = ({
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
      <MenuItem
        onClick={onDeleteClick}
        data-cy="film-sim-delete-menu-item"
      >
        <ListItemIcon>
          <DeleteIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText primary="Delete" />
      </MenuItem>
    </Menu>
  );
};

export default FilmSimOwnerMenu;

