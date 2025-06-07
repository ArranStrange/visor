import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
  Avatar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import NotificationPanel from "./NotificationPanel";
import UploadIcon from "@mui/icons-material/CloudUpload";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SeachModal from "../../components/SearchModal";

import Logo from "../../assets/VISOR.png";

const NavBar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = React.useState(false);

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
          {/* <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ color: "text.primary" }}
          >
            VISOR
          </Typography> */}
        </Box>

        {/* Actions */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: isMobile ? 1 : 2 }}
        >
          <IconButton onClick={() => setSearchOpen(true)} color="inherit">
            <SearchIcon />
          </IconButton>
          <NotificationPanel />
          <IconButton onClick={() => navigate("/upload")} color="inherit">
            <UploadIcon />
          </IconButton>

          {/* Auth or Profile */}
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => navigate("/login")}
            sx={{ display: { xs: "none", sm: "inline-flex" }, borderRadius: 2 }}
          >
            Login
          </Button>

          {/* Replace with user's avatar if logged in */}
          {/* <Avatar
            src="/avatars/arran.png"
            sx={{ width: 32, height: 32, cursor: 'pointer' }}
            onClick={() => navigate('/profile/arran')}
          /> */}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
