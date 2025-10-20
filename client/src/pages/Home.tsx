import React from "react";
import { Box, Container, InputBase, Stack, Typography } from "@mui/material";
import FeaturedHeroSection from "../components/ui/FeaturedHeroSection";
import FeaturedListHero from "../components/ui/FeaturedListHero";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import {
  GET_ALL_TAGS,
  GET_ALL_TAGS_OPTIONS,
} from "../graphql/queries/getAllTags";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState("");
  const logoUrl = new URL("../assets/VISOR.png", import.meta.url).href;

  // Load tags for clickable shortcuts (same source as Search page)
  const { data: tagData } = useQuery(GET_ALL_TAGS, GET_ALL_TAGS_OPTIONS);
  const allTags =
    tagData?.listTags?.filter((tag: any) => tag?.displayName) || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length === 0) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <Box>
      {/* Landing Search */}
      <Box sx={{ minHeight: "80vh", display: "flex", alignItems: "center" }}>
        <Container maxWidth="lg">
          <Stack alignItems="center" spacing={4}>
            <Box
              component="img"
              src={logoUrl}
              alt="VISOR logo"
              sx={{ height: { xs: 33, md: 44 } }}
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
                  height: { xs: 44, md: 50 },
                }}
              />
            </Box>

            {/* Tag shortcuts */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                width: { xs: "100%", sm: "80%", md: 600 },
                mx: "auto",
              }}
            >
              <Typography
                onClick={() => navigate("/search")}
                sx={{
                  cursor: "pointer",
                  opacity: 0.8,
                  transition: "opacity 0.2s",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  "&:hover": {
                    textDecoration: "underline",
                    textUnderlineOffset: "4px",
                  },
                }}
              >
                all
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                sx={{
                  overflowX: "auto",
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": { display: "none" },
                  flex: 1,
                  scrollSnapType: "x mandatory",
                  "& > *": { scrollSnapAlign: "start" },
                }}
              >
                {allTags.map((tag: any) => (
                  <Typography
                    key={tag.id}
                    onClick={() =>
                      navigate(
                        `/search?tag=${encodeURIComponent(tag.displayName)}`
                      )
                    }
                    sx={{
                      cursor: "pointer",
                      opacity: 0.8,
                      transition: "opacity 0.2s",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      textTransform: "lowercase",
                    }}
                  >
                    {tag.displayName.toLowerCase()}
                  </Typography>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Container>
      </Box>
      {/* Featured Film Sim Hero */}
      <Box sx={{ my: { xs: 2, md: 2 } }}>
        <FeaturedHeroSection type="filmsim" />
      </Box>

      {/* Featured List Hero */}
      <Box sx={{ my: { xs: 2, md: 2 } }}>
        <FeaturedListHero />
      </Box>

      {/* Featured Preset Hero */}
      <Box sx={{ my: { xs: 2, md: 2 } }}>
        <FeaturedHeroSection type="preset" />
      </Box>
    </Box>
  );
};

export default HomePage;
