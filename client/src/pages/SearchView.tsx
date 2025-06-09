import React, { useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  InputBase,
  Stack,
  Divider,
} from "@mui/material";
import { useQuery, gql } from "@apollo/client";

import PresetCard from "../components/PresetCard";
import FilmSimCard from "../components/FilmSimCard";
import ContentTypeToggle from "../components/ContentTypeToggle";
import StaggeredGrid from "../components/StaggeredGrid";
import { useContentType } from "../context/ContentTypeFilter";
import { GET_ALL_TAGS } from "../graphql/queries/getAllTags";

// Apollo GraphQL queries
const LIST_PRESETS = gql`
  query ListPresets {
    listPresets {
      id
      title
      slug
      tags {
        displayName
      }
      creator {
        username
        avatar
      }
      thumbnail: sampleImages {
        url
      }
    }
  }
`;

const LIST_FILMSIMS = gql`
  query ListFilmSims {
    listFilmSims(filter: {}) {
      id
      name
      slug
      tags {
        displayName
      }
      creator {
        username
        avatar
      }
      thumbnail: sampleImages {
        url
      }
    }
  }
`;

const SearchView: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const { contentType } = useContentType();

  // GraphQL queries
  const {
    data: tagData,
    loading: tagsLoading,
    error: tagsError,
  } = useQuery(GET_ALL_TAGS);
  const { data: presetData, error: presetsError } = useQuery(LIST_PRESETS);
  const { data: filmSimData, error: filmSimsError } = useQuery(LIST_FILMSIMS);

  // Log any errors
  React.useEffect(() => {
    if (tagsError) console.error("Tags Error:", tagsError);
    if (presetsError) console.error("Presets Error:", presetsError);
    if (filmSimsError) console.error("Film Sims Error:", filmSimsError);
  }, [tagsError, presetsError, filmSimsError]);

  const allTags = tagData?.listTags || [];
  const presets = presetData?.listPresets || [];
  const filmSims = filmSimData?.listFilmSims || [];

  const combined = useMemo(() => {
    let all: { type: "preset" | "film"; data: any }[] = [];

    if (contentType === "all" || contentType === "presets") {
      all.push(
        ...presets.map((p) => ({
          type: "preset" as const,
          data: {
            ...p,
            thumbnail: p.thumbnail?.[0]?.url ?? "",
          },
        }))
      );
    }

    if (contentType === "all" || contentType === "films") {
      all.push(
        ...filmSims.map((f) => ({
          type: "film" as const,
          data: {
            ...f,
            title: f.name,
            thumbnail: f.thumbnail?.[0]?.url ?? "",
          },
        }))
      );
    }

    if (activeTag) {
      all = all.filter((item) =>
        item.data.tags?.some(
          (tag: any) =>
            tag.displayName?.toLowerCase() === activeTag.toLowerCase()
        )
      );
    }

    if (keyword) {
      const lower = keyword.toLowerCase();
      all = all.filter(
        (item) =>
          item.data.title?.toLowerCase().includes(lower) ||
          item.data.name?.toLowerCase().includes(lower) ||
          item.data.description?.toLowerCase().includes(lower) ||
          item.data.tags?.some((tag: any) =>
            tag.displayName?.toLowerCase().includes(lower)
          ) ||
          item.data.toneProfile?.toLowerCase().includes(lower)
      );
    }

    return all;
  }, [activeTag, keyword, contentType, presets, filmSims]);

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
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {allTags.map((tag: any) => (
          <Typography
            key={tag.id}
            onClick={() =>
              setActiveTag((prev) =>
                prev === tag.displayName ? null : tag.displayName
              )
            }
            sx={{
              cursor: "pointer",
              fontWeight: activeTag === tag.displayName ? "bold" : "normal",
              textDecoration:
                activeTag === tag.displayName ? "underline" : "none",
              textUnderlineOffset: "4px",
              opacity: activeTag === tag.displayName ? 1 : 0.6,
              transition: "opacity 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {tag.displayName}
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
