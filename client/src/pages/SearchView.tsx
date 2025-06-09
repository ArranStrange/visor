import React, { useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  InputBase,
  Stack,
  Divider,
} from "@mui/material";

import { presets } from "../data/presets";
import { filmSims } from "../data/filmsims";
import { allTags } from "../data/tags";

import PresetCard from "../components/PresetCard";
import FilmSimCard from "../components/FilmSimCard";
import ContentTypeToggle from "../components/ContentTypeToggle";
import StaggeredGrid from "../components/StaggeredGrid";
import { useContentType } from "../context/ContentTypeFilter";

const SearchView: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const { contentType } = useContentType();

  const combined = useMemo(() => {
    let all: { type: "preset" | "film"; data: any }[] = [];

    if (contentType === "all" || contentType === "presets") {
      all.push(...presets.map((p) => ({ type: "preset" as const, data: p })));
    }

    if (contentType === "all" || contentType === "films") {
      all.push(...filmSims.map((f) => ({ type: "film" as const, data: f })));
    }

    if (activeTag) {
      all = all.filter((item) =>
        item.data.tags?.some(
          (tag) => tag.toLowerCase() === activeTag.toLowerCase()
        )
      );
    }

    if (keyword) {
      const lower = keyword.toLowerCase();
      all = all.filter(
        (item) =>
          item.data.title.toLowerCase().includes(lower) ||
          item.data.tags?.some((tag) => tag.toLowerCase().includes(lower)) ||
          item.data.toneProfile?.toLowerCase().includes(lower) || // film sims
          item.data.description?.toLowerCase().includes(lower) // presets (if added)
      );
    }

    return all;
  }, [activeTag, keyword, contentType]);

  return (
    <Container maxWidth="lg" sx={{ py: 4, mb: 20 }}>
      <InputBase
        placeholder="Search presets, film sims, tags…"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        fullWidth
        sx={{
          px: 2,
          py: 1,
          borderRadius: 2,
          backgroundColor: "rgba(255,255,255,0.08)",
          color: "white",
          mb: 2,
        }}
      />

      <Stack
        direction="row"
        spacing={2}
        sx={{
          overflowX: "auto",
          mb: 2,
          scrollbarWidth: "none", // Firefox
          "&::-webkit-scrollbar": { display: "none" }, // Chrome/Safari
        }}
      >
        {allTags.map((tag) => (
          <Typography
            key={tag}
            onClick={() => setActiveTag((prev) => (prev === tag ? null : tag))}
            sx={{
              cursor: "pointer",
              fontWeight: activeTag === tag ? "bold" : "normal",
              textDecoration: activeTag === tag ? "underline" : "none",
              textUnderlineOffset: "4px",
              opacity: activeTag === tag ? 1 : 0.6,
              transition: "opacity 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {tag}
          </Typography>
        ))}
      </Stack>

      <ContentTypeToggle />

      <Divider sx={{ my: 2 }} />

      <StaggeredGrid>
        {combined.map((item, index) => (
          <React.Fragment key={`${item.type}-${item.data.id}-${index}`}>
            {item.type === "preset" ? (
              <PresetCard {...item.data} />
            ) : (
              <FilmSimCard {...item.data} />
            )}
          </React.Fragment>
        ))}
      </StaggeredGrid>
    </Container>
  );
};

export default SearchView;
