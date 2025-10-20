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
import { useSearchParams } from "react-router-dom";

import ContentTypeToggle from "../components/ui/ContentTypeToggle";
import ContentGridLoader from "../components/ui/ContentGridLoader";
import { useContentType } from "../context/ContentTypeFilter";
import {
  GET_ALL_TAGS,
  GET_ALL_TAGS_OPTIONS,
} from "../graphql/queries/getAllTags";

const SearchView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const { contentType } = useContentType();

  const {
    data: tagData,
    loading: tagsLoading,
    error: tagsError,
  } = useQuery(GET_ALL_TAGS, GET_ALL_TAGS_OPTIONS);

  const allTags =
    tagData?.listTags?.filter((tag: any) => tag?.displayName) || [];

  useEffect(() => {
    const qParam = searchParams.get("q");
    if (qParam) {
      setKeyword(qParam);
    }

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

  const isLoading = tagsLoading;

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

      <ContentGridLoader
        contentType={contentType}
        searchQuery={keyword}
        filter={activeTagId ? { tagId: activeTagId } : undefined}
      />
    </Container>
  );
};

export default SearchView;
