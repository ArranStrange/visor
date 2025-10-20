import React from "react";
import { Box } from "@mui/material";
import FeaturedHeroSection from "../components/ui/FeaturedHeroSection";
import FeaturedListHero from "../components/ui/FeaturedListHero";

const HomePage: React.FC = () => {
  return (
    <Box>
      {/* Featured Film Sim Hero */}
      <FeaturedHeroSection type="filmsim" />

      {/* Featured List Hero */}
      <FeaturedListHero />

      {/* Featured Preset Hero */}
      <FeaturedHeroSection type="preset" />
    </Box>
  );
};

export default HomePage;
