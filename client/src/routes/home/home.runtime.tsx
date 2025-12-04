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
import { ExploreButton } from "./components/explore-button";

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
