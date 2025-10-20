import React from "react";
import { Box } from "@mui/material";
import FeaturedHeroSection from "../components/ui/FeaturedHeroSection";
import FeaturedCardsGrid from "../components/ui/FeaturedCardsGrid";

const HomePage: React.FC = () => {
  return (
    <Box>
      {/* Featured Film Sim Hero */}
      <FeaturedHeroSection type="filmsim" />

      {/* Featured Items Grid */}
      <FeaturedCardsGrid />

      {/* Featured Preset Hero */}
      <FeaturedHeroSection type="preset" />
    </Box>
  );
};

export default HomePage;
