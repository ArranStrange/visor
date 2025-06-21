import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  InputBase,
  Stack,
  Divider,
} from "@mui/material";
import { useQuery } from "@apollo/client";
import { useSearchParams, useNavigate } from "react-router-dom";

import ContentTypeToggle from "../components/ContentTypeToggle";
import ContentGridLoader from "../components/ContentGridLoader";
import { useContentType } from "../context/ContentTypeFilter";
import {
  GET_ALL_TAGS,
  GET_ALL_TAGS_OPTIONS,
} from "../graphql/queries/getAllTags";
import { GET_ALL_PRESETS } from "../graphql/queries/getAllPresets";
import { GET_ALL_FILMSIMS } from "../graphql/queries/getAllFilmSims";

const SearchView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const { contentType } = useContentType();

  const {
    data: tagData,
    loading: tagsLoading,
    error: tagsError,
  } = useQuery(GET_ALL_TAGS, GET_ALL_TAGS_OPTIONS);

  const {
    data: presetData,
    loading: loadingPresets,
    error: presetError,
  } = useQuery(GET_ALL_PRESETS);

  const {
    data: filmSimData,
    loading: loadingFilmSims,
    error: filmSimError,
  } = useQuery(GET_ALL_FILMSIMS);

  const allTags =
    tagData?.listTags?.filter((tag: any) => tag?.displayName) || [];

  // Read tag parameter from URL on component mount
  useEffect(() => {
    const tagParam = searchParams.get("tag");
    if (tagParam) {
      const tag = allTags.find(
        (t: any) => t.displayName.toLowerCase() === tagParam.toLowerCase()
      );
      if (tag) {
        setActiveTagId(tag.id);
      }
    }
  }, [searchParams, allTags]);

  const activeTagDisplayName = useMemo(() => {
    return (
      allTags.find((tag: any) => tag.id === activeTagId)?.displayName || null
    );
  }, [activeTagId, allTags]);

  const handleClear = () => {
    setKeyword("");
    setActiveTagId(null);
    setSearchParams({});
  };

  const handleTagClick = (tagId: string, tagDisplayName: string) => {
    const newActiveTagId = activeTagId === tagId ? null : tagId;
    setActiveTagId(newActiveTagId);

    if (newActiveTagId) {
      setSearchParams({ tag: tagDisplayName });
    } else {
      setSearchParams({});
    }
  };

  // Filter data locally based on active tag
  const filteredData = useMemo(() => {
    const results: { type: "preset" | "film"; data: any }[] = [];

    // Filter presets
    if (
      (contentType === "all" || contentType === "presets") &&
      presetData?.listPresets
    ) {
      const filteredPresets = presetData.listPresets
        .filter((p: any) => p && p.creator)
        .filter((p: any) => {
          // Apply keyword filter - search across all fields
          if (keyword) {
            const searchTerm = keyword.toLowerCase();
            const searchableText = [
              p.title,
              p.description,
              p.notes,
              p.creator?.username,
              ...(p.tags?.map((tag: any) => tag.displayName) || []),
            ]
              .join(" ")
              .toLowerCase();

            if (!searchableText.includes(searchTerm)) {
              return false;
            }
          }
          // Apply tag filter
          if (activeTagId) {
            return p.tags?.some((tag: any) => tag.id === activeTagId);
          }
          return true;
        })
        .map((p: any) => ({
          type: "preset" as const,
          data: p,
        }));
      results.push(...filteredPresets);
    }

    // Filter film sims
    if (
      (contentType === "all" || contentType === "films") &&
      filmSimData?.listFilmSims
    ) {
      const filteredFilmSims = filmSimData.listFilmSims
        .filter((f: any) => f && f.creator)
        .filter((f: any) => {
          // Apply keyword filter - search across all fields
          if (keyword) {
            const searchTerm = keyword.toLowerCase();
            const searchableText = [
              f.name,
              f.description,
              f.notes,
              f.creator?.username,
              ...(f.tags?.map((tag: any) => tag.displayName) || []),
            ]
              .join(" ")
              .toLowerCase();

            if (!searchableText.includes(searchTerm)) {
              return false;
            }
          }
          // Apply tag filter
          if (activeTagId) {
            return f.tags?.some((tag: any) => tag.id === activeTagId);
          }
          return true;
        })
        .map((f: any) => ({
          type: "film" as const,
          data: {
            ...f,
            title: f.name,
            thumbnail: f.sampleImages?.[0]?.url || "",
            tags: f.tags || [],
          },
        }));
      results.push(...filteredFilmSims);
    }

    return results;
  }, [contentType, presetData, filmSimData, keyword, activeTagId]);

  const isLoading = loadingPresets || loadingFilmSims || tagsLoading;

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

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          gap: 2,
        }}
      >
        <Typography
          onClick={handleClear}
          sx={{
            cursor: "pointer",
            opacity: keyword || activeTagId ? 1 : 0.6,
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
            "& > *": {
              scrollSnapAlign: "start",
            },
          }}
        >
          {allTags.map((tag: any) => (
            <Typography
              key={tag.id}
              onClick={() => handleTagClick(tag.id, tag.displayName)}
              sx={{
                cursor: "pointer",
                fontWeight: activeTagId === tag.id ? "bold" : "normal",
                textDecoration: activeTagId === tag.id ? "underline" : "none",
                textUnderlineOffset: "4px",
                opacity: activeTagId === tag.id ? 1 : 0.6,
                transition: "opacity 0.2s",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {tag.displayName.toLowerCase()}
            </Typography>
          ))}
        </Stack>
      </Box>

      <ContentTypeToggle />
      <Divider sx={{ my: 2 }} />

      <ContentGridLoader contentType={contentType} customData={filteredData} />
    </Container>
  );
};

export default SearchView;
