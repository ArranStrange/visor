import React from "react";
import { Box } from "@mui/material";
import FeaturedHeroSection from "../components/ui/FeaturedHeroSection";
import FeaturedListHero from "../components/ui/FeaturedListHero";
import FeaturedPhotoBackground from "../components/ui/FeaturedPhotoBackground";
import SearchHero from "../components/ui/SearchHero";

const HomePage: React.FC = () => {
  return (
    <Box>
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
        <SearchHero />
      </Box>

      <Box sx={{ my: { xs: 2, md: 2 } }}>
        <FeaturedHeroSection type="filmsim" />
      </Box>

      <Box sx={{ my: { xs: 2, md: 2 } }}>
        <FeaturedListHero />
      </Box>

      <Box sx={{ my: { xs: 2, md: 2 } }}>
        <FeaturedHeroSection type="preset" />
      </Box>
    </Box>
  );
};

export default HomePage;
