/**
 * Home Route Runtime Plugins
 *
 * Registers default home page content via slots
 */

import { Box } from "@mui/material";
import FeaturedHeroSection from "components/ui/FeaturedHeroSection";
import FeaturedListHero from "components/ui/FeaturedListHero";
import {
  HomePageFeaturedSection,
  HomePageTile,
} from "lib/slots/slot-definitions";

HomePageFeaturedSection.plug(
  <Box key="filmsim-section" sx={{ my: { xs: 2, md: 1 } }}>
    <FeaturedHeroSection type="filmsim" />
  </Box>,
  10
);

HomePageFeaturedSection.plug(
  <Box key="list-section" sx={{ my: { xs: 2, md: 1 } }}>
    <FeaturedListHero />
  </Box>,
  20
);

HomePageFeaturedSection.plug(
  <Box key="preset-section" sx={{ my: { xs: 2, md: 1 } }}>
    <FeaturedHeroSection type="preset" />
  </Box>,
  30
);

// Register default "Explore VISOR" button
HomePageTile.plug(
  <Box
    key="explore-button"
    sx={{
      width: "100%",
      py: 4,
      px: 2,
      display: "flex",
      justifyContent: "center",
    }}
  >
    <ExploreButton />
  </Box>,
  100
);

// Explore button component
import { Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

function ExploreButton() {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/search")}
      startIcon={<SearchIcon />}
      sx={{
        textTransform: "none",
        py: 1.5,
        px: { xs: 2, md: 4 },
        width: { xs: "100%", md: "auto" },
        fontSize: "0.95rem",
        fontWeight: 500,
        backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.03)",
        color: "text.primary",
        "&:hover": {
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(0, 0, 0, 0.05)",
        },
      }}
    >
      Explore VISOR
    </Button>
  );
}
