import React from "react";
import { Box, Container } from "@mui/material";
import PresetCard from "../components/PresetCard";
import FilmSimCard from "../components/FilmSimCard";
import { useContentType } from "../context/ContentTypeFilter";

import { filmSims } from "../data/filmsims";
import { presets } from "../data/presets";

const cardMasonryStyles = {
  columnCount: {
    xs: 2,
    md: 4,
  },
  columnGap: {
    xs: 2,
    md: 5,
  },
};

const cardItemStyles = {
  breakInside: "avoid",
  mb: 2,
  width: "100%",
  transition: "margin-top 0.3s ease",
};

// Shuffle helper
function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const HomePage: React.FC = () => {
  const { contentType } = useContentType();

  // Combine and shuffle cards
  const combined = React.useMemo(() => {
    const data: { type: "preset" | "film"; data: any }[] = [];

    if (contentType === "all" || contentType === "presets") {
      data.push(...presets.map((p) => ({ type: "preset" as const, data: p })));
    }

    if (contentType === "all" || contentType === "films") {
      data.push(...filmSims.map((f) => ({ type: "film" as const, data: f })));
    }

    return shuffle(data);
  }, [contentType]);

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 50 }}>
      <Box sx={cardMasonryStyles}>
        {combined.map((item, index) => (
          <Box
            key={`${item.type}-${item.data.id}-${index}`}
            sx={{
              ...cardItemStyles,
              mt: [1, 3].includes(index % 4) ? 4 : 0, // stagger 2nd and 4th columns
            }}
          >
            {item.type === "preset" ? (
              <PresetCard {...item.data} />
            ) : (
              <FilmSimCard {...item.data} />
            )}
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default HomePage;
