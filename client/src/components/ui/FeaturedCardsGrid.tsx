import React from "react";
import { Box, Typography, Container } from "@mui/material";
import { useQuery } from "@apollo/client";
import { GET_FEATURED_ITEMS } from "../../graphql/queries/getFeaturedItems";
import PresetCard from "../cards/PresetCard";
import FilmSimCard from "../cards/FilmSimCard";

const FeaturedCardsGrid: React.FC = () => {
  const { data, loading } = useQuery(GET_FEATURED_ITEMS);

  if (loading) {
    return null;
  }

  const featuredPresets = data?.featuredPreset || [];
  const featuredFilmSims = data?.featuredFilmSim || [];

  // Combine all featured items and sort by creation date or randomize
  const allFeaturedItems = [
    ...featuredPresets.map((preset: any) => ({ ...preset, type: "preset" })),
    ...featuredFilmSims.map((filmSim: any) => ({
      ...filmSim,
      type: "filmsim",
    })),
  ];

  if (allFeaturedItems.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 6 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ mb: 4, textAlign: "center" }}
        >
          Featured Content
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {allFeaturedItems.map((item: any, index: number) => {
            if (item.type === "preset") {
              return (
                <PresetCard
                  key={`featured-preset-${item.id}-${index}`}
                  {...item}
                />
              );
            } else {
              return (
                <FilmSimCard
                  key={`featured-filmsim-${item.id}-${index}`}
                  {...item}
                />
              );
            }
          })}
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturedCardsGrid;
