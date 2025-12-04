import React from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Box,
  Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { NavbarUserMenuItems } from "../../../lib/slots/slot-definitions";

export function NavbarUserMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <IconButton onClick={handleMenuOpen} color="inherit" sx={{ ml: 1 }}>
        <Avatar
          src={user.avatar}
          alt={user.username}
          sx={{
            width: 32,
            height: 32,
            bgcolor: user.avatar ? "transparent" : "primary.main",
          }}
        >
          {user.username?.[0]?.toUpperCase()}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "& .MuiMenuItem-root": {
              px: 2,
              py: 1.5,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {user.username}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
        <Divider />
        {/* Menu items from plugins */}
        <NavbarUserMenuItems.Slot
          user={user}
          onClose={handleMenuClose}
          navigate={navigate}
        />
        {/* Logout button (always at the end) */}
        <MenuItem onClick={handleLogout}>
          <LogoutIcon />
          Log Out
        </MenuItem>
      </Menu>
    </>
  );
}
