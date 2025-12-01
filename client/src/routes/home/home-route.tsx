import React from "react";
import { Box } from "@mui/material";
import FeaturedPhotoBackground from "components/ui/FeaturedPhotoBackground";
import SearchHero from "components/ui/SearchHero";
import {
  HomePageHero,
  HomePageTile,
  HomePageFeaturedSection,
} from "lib/slots/slot-definitions";

export default function HomeRoute() {
  return (
    <Box>
      {/* Hero Section with Search */}
      <Box
        sx={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <FeaturedPhotoBackground />
        <HomePageHero.Slot>
          <SearchHero />
        </HomePageHero.Slot>
      </Box>

      {/* Featured Sections - Plugins can inject here */}
      <HomePageFeaturedSection.Slot />

      {/* Home Page Tiles - Plugins can inject widgets here */}
      <HomePageTile.Slot />
    </Box>
  );
}
