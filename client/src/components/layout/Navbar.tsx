import React from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Button,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import UploadIcon from "@mui/icons-material/CloudUpload";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ListIcon from "@mui/icons-material/List";
import ForumIcon from "@mui/icons-material/Forum";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../assets/VISOR.png";
import NotificationBell from "./NotificationBell";

const NavBar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [searchOpen, setSearchOpen] = React.useState(false);
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

  const menuItems = [
    {
      text: "Profile",
      icon: <AccountCircleIcon />,
      onClick: () => {
        handleMenuClose();
        navigate(`/profile/${user?.id}`);
      },
      divider: true,
    },
    {
      text: "Lists",
      icon: <ListIcon />,
      onClick: () => {
        handleMenuClose();
        navigate("/lists");
      },
    },
    {
      text: "Discussions",
      icon: <ForumIcon />,
      onClick: () => {
        handleMenuClose();
        navigate("/discussions");
      },
    },
    {
      text: "Notifications",
      icon: <NotificationsIcon />,
      onClick: () => {
        handleMenuClose();
        navigate("/notifications");
      },
    },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={2}
      sx={{ backgroundColor: "background.paper" }}
    >
      <Toolbar sx={{ justifyContent: "space-between", gap: 2 }}>
        {/* Logo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <img src={Logo} alt="VISOR logo" style={{ height: 28 }} />
        </Box>

        {/* Actions */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: isMobile ? 1 : 2 }}
        >
          <IconButton onClick={() => navigate("/search")} color="inherit">
            <SearchIcon />
          </IconButton>
          {isAuthenticated && (
            <>
              <NotificationBell />
              <IconButton onClick={() => navigate("/upload")} color="inherit">
                <UploadIcon />
              </IconButton>
            </>
          )}

          {isAuthenticated && user ? (
            <>
              <IconButton
                onClick={handleMenuOpen}
                color="inherit"
                sx={{ ml: 1 }}
              >
                <Avatar
                  src={user.avatar}
                  alt={user.username}
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: user.avatar ? "transparent" : "primary.main",
                  }}
                  onError={(e) => {
                    // console.log("Avatar image failed to load:", user.avatar);
                    // Don't hide the avatar, just log the error
                  }}
                  // onLoad={() => {
                  //   console.log(
                  //     "Avatar image loaded successfully:",
                  //     user.avatar
                  //   );
                  // }}
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
                {menuItems.map((item, index) => (
                  <React.Fragment key={item.text}>
                    <MenuItem onClick={item.onClick}>
                      {item.icon}
                      {item.text}
                    </MenuItem>
                    {item.divider && <Divider />}
                  </React.Fragment>
                ))}
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon />
                  Log Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <IconButton
                onClick={() => navigate("/login")}
                color="inherit"
                sx={{ display: { xs: "flex", sm: "none" } }}
              >
                <LoginIcon />
              </IconButton>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => navigate("/login")}
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  borderRadius: 2,
                }}
              >
                Login
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
