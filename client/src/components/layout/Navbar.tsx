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
import MenuIcon from "@mui/icons-material/Menu";
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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
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
      role="banner"
      aria-label="Main navigation"
    >
      <Toolbar sx={{ justifyContent: "space-between", gap: 2 }}>
        {/* Logo */}
        <Box
          data-cy="nav-home"
          component="a"
          href="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            textDecoration: "none",
            color: "inherit",
          }}
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          onKeyDown={(e) => handleKeyDown(e, () => navigate("/"))}
          tabIndex={0}
          role="button"
          aria-label="Go to home page"
        >
          <img src={Logo} alt="VISOR logo" style={{ height: 28 }} />
        </Box>

        {/* Actions */}
        <Box
          data-cy="nav-actions"
          component="nav"
          aria-label="Navigation actions"
          sx={{ display: "flex", alignItems: "center", gap: isMobile ? 1 : 2 }}
        >
          {/* Search icon - visible on all screen sizes */}
          <IconButton
            data-cy="nav-search"
            onClick={() => navigate("/search")}
            color="inherit"
            aria-label="Search presets and film simulations"
            title="Search"
          >
            <SearchIcon />
          </IconButton>

          {/* Mobile menu button - only show when authenticated */}
          {isAuthenticated && (
            <IconButton
              data-cy="mobile-menu-button"
              onClick={handleMobileMenuToggle}
              color="inherit"
              aria-label={
                mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"
              }
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              sx={{ display: { xs: "flex", sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {isAuthenticated && (
            <>
              <NotificationBell />
              <IconButton
                data-cy="nav-upload"
                onClick={() => navigate("/upload")}
                color="inherit"
                aria-label="Upload new content"
                title="Upload"
              >
                <UploadIcon />
              </IconButton>
            </>
          )}

          {isAuthenticated && user ? (
            <>
              <IconButton
                onClick={handleMenuOpen}
                color="inherit"
                aria-label={`User menu for ${user.username}`}
                aria-expanded={Boolean(anchorEl)}
                aria-controls="user-menu"
                aria-haspopup="true"
                sx={{ ml: 1 }}
              >
                <Avatar
                  src={user.avatar}
                  alt={`${user.username}'s avatar`}
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
                id="user-menu"
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
                role="menu"
                aria-label="User account menu"
              >
                <Box sx={{ px: 2, py: 1.5 }} role="presentation">
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
                    <MenuItem
                      onClick={item.onClick}
                      role="menuitem"
                      aria-label={item.text}
                    >
                      {item.icon}
                      {item.text}
                    </MenuItem>
                    {item.divider && <Divider />}
                  </React.Fragment>
                ))}
                <MenuItem
                  onClick={handleLogout}
                  role="menuitem"
                  aria-label="Log out"
                >
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
                aria-label="Sign in"
                title="Sign in"
                sx={{ display: { xs: "flex", sm: "none" } }}
              >
                <LoginIcon />
              </IconButton>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => navigate("/login")}
                aria-label="Sign in to your account"
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

        {/* Mobile Menu - only show when authenticated */}
        {isAuthenticated && mobileMenuOpen && (
          <Box
            id="mobile-menu"
            data-cy="mobile-menu"
            component="nav"
            aria-label="Mobile navigation menu"
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              backgroundColor: "background.paper",
              borderTop: 1,
              borderColor: "divider",
              zIndex: 1000,
            }}
          >
            <Box
              sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}
              role="menu"
            >
              {/* Search removed from mobile dropdown since it's in the main nav */}
              <Button
                data-cy="mobile-nav-upload"
                fullWidth
                startIcon={<UploadIcon />}
                onClick={() => {
                  navigate("/upload");
                  setMobileMenuOpen(false);
                }}
                role="menuitem"
                aria-label="Upload new content"
              >
                Upload
              </Button>
              <Button
                data-cy="mobile-nav-discussions"
                fullWidth
                startIcon={<ForumIcon />}
                onClick={() => {
                  navigate("/discussions");
                  setMobileMenuOpen(false);
                }}
                role="menuitem"
                aria-label="View discussions"
              >
                Discussions
              </Button>
              <Button
                data-cy="mobile-nav-lists"
                fullWidth
                startIcon={<ListIcon />}
                onClick={() => {
                  navigate("/lists");
                  setMobileMenuOpen(false);
                }}
                role="menuitem"
                aria-label="View your lists"
              >
                Lists
              </Button>
            </Box>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
