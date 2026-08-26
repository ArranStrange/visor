import React from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FlagIcon from "@mui/icons-material/Flag";

/**
 * The ⋮ menu on a preset or film sim. Owners get edit and delete; everyone
 * else who is signed in gets Report — which is why this is no longer the
 * owner-only menu it started as.
 */
interface ContentActionsMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReport?: () => void;
  deleteTestId?: string;
}

const ContentActionsMenu: React.FC<ContentActionsMenuProps> = ({
  anchorEl,
  open,
  onClose,
  isOwner,
  onEdit,
  onDelete,
  onReport,
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
      {isOwner && (
        <MenuItem onClick={onEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>
      )}
      {isOwner && (
        <MenuItem onClick={onDelete} data-cy={deleteTestId}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      )}
      {/* Reporting your own upload is meaningless, so owners do not see it. */}
      {!isOwner && onReport && (
        <MenuItem onClick={onReport} data-cy="report-menu-item">
          <ListItemIcon>
            <FlagIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Report" />
        </MenuItem>
      )}
    </Menu>
  );
};

export default ContentActionsMenu;
