import React from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface OwnerMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleteTestId?: string;
}

const OwnerMenu: React.FC<OwnerMenuProps> = ({
  anchorEl,
  open,
  onClose,
  onEdit,
  onDelete,
  deleteTestId,
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: "background.paper",
          boxShadow: 1,
        },
      }}
    >
      <MenuItem onClick={onEdit}>
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Edit" />
      </MenuItem>
      <MenuItem onClick={onDelete} data-cy={deleteTestId}>
        <ListItemIcon>
          <DeleteIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText primary="Delete" />
      </MenuItem>
    </Menu>
  );
};

export default OwnerMenu;
