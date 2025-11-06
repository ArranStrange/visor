import React from "react";
import { Box, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import FeaturedHeroSection from "../components/ui/FeaturedHeroSection";
import FeaturedListHero from "../components/ui/FeaturedListHero";
import FeaturedPhotoBackground from "../components/ui/FeaturedPhotoBackground";
import SearchHero from "../components/ui/SearchHero";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

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

      <Box sx={{ my: { xs: 2, md: 1 } }}>
        <FeaturedHeroSection type="filmsim" />
      </Box>

      <Box sx={{ my: { xs: 2, md: 1 } }}>
        <FeaturedListHero />
      </Box>

      <Box sx={{ my: { xs: 2, md: 1 } }}>
        <FeaturedHeroSection type="preset" />
      </Box>

      <Box
        sx={{
          width: "100%",
          py: 4,
          px: 2,
          display: "flex",
          justifyContent: "center",
        }}
      >
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
      </Box>
    </Box>
  );
};

export default HomePage;
