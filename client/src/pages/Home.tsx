import React from "react";
import { Box, Container, InputBase, Stack } from "@mui/material";
import FeaturedHeroSection from "../components/ui/FeaturedHeroSection";
import FeaturedListHero from "../components/ui/FeaturedListHero";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState("");
  const logoUrl = new URL("../assets/VISOR.png", import.meta.url).href;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length === 0) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <Box>
      {/* Landing Search */}
      <Container maxWidth="lg" sx={{ py: { xs: 10, md: 16 } }}>
        <Stack alignItems="center" spacing={4}>
          <Box
            component="img"
            src={logoUrl}
            alt="VISOR logo"
            sx={{ height: { xs: 44, md: 56 } }}
          />
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <InputBase
              placeholder="Search VISOR..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              fullWidth={false}
              sx={{
                px: 2.5,
                py: 2,
                borderRadius: 6,
                backgroundColor: (t) =>
                  t.palette.mode === "dark"
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.04)",
                fontSize: { xs: "1rem", md: "1.05rem" },
                width: { xs: "100%", sm: "80%", md: 600 },
              }}
            />
          </Box>
        </Stack>
      </Container>
      {/* Featured Film Sim Hero */}
      <Box sx={{ my: { xs: 6, md: 10 } }}>
        <FeaturedHeroSection type="filmsim" />
      </Box>

      {/* Featured List Hero */}
      <Box sx={{ my: { xs: 6, md: 10 } }}>
        <FeaturedListHero />
      </Box>

      {/* Featured Preset Hero */}
      <Box sx={{ my: { xs: 6, md: 10 } }}>
        <FeaturedHeroSection type="preset" />
      </Box>
    </Box>
  );
};

export default HomePage;
