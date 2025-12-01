import React from "react";
import { AppBar, Toolbar, Box } from "@mui/material";
import {
  NavbarLeft,
  NavbarRight,
  NavbarCenter,
} from "../../lib/slots/slot-definitions";

const NavBar: React.FC = () => {
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when at the top
      if (currentScrollY < 10) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Hide when scrolling down, show when scrolling up
      // Using a threshold of 5px for quick response
      if (Math.abs(currentScrollY - lastScrollY) > 5) {
        setIsVisible(currentScrollY < lastScrollY);
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <AppBar
      position="sticky"
      elevation={2}
      sx={{
        backgroundColor: "background.paper",
        transform: isVisible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.2s ease-in-out",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", gap: 2 }}>
        {/* Left side - plugins inject content here */}
        <NavbarLeft.Slot />

        {/* Center - plugins can inject content here */}
        <NavbarCenter.Slot />

        {/* Right side - plugins inject content here */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
          }}
        >
          <NavbarRight.Slot />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
