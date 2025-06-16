import React, { useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  InputBase,
  Stack,
  Divider,
} from "@mui/material";
import { useQuery } from "@apollo/client";

import ContentTypeToggle from "../components/ContentTypeToggle";
import ContentGridLoader from "../components/ContentGridLoader";
import { useContentType } from "../context/ContentTypeFilter";
import {
  GET_ALL_TAGS,
  GET_ALL_TAGS_OPTIONS,
} from "../graphql/queries/getAllTags";

const SearchView: React.FC = () => {
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

  const activeTagDisplayName = useMemo(() => {
    return (
      allTags.find((tag: any) => tag.id === activeTagId)?.displayName || null
    );
  }, [activeTagId, allTags]);

  const handleClear = () => {
    setKeyword("");
    setActiveTagId(null);
  };

  const filter = activeTagId
    ? {
        tags: {
          $in: [activeTagId],
        },
      }
    : undefined;

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
        <Typography
          onClick={handleClear}
          sx={{
            cursor: "pointer",
            opacity: keyword || activeTagId ? 1 : 0.6,
            transition: "opacity 0.2s",
            whiteSpace: "nowrap",
            "&:hover": {
              textDecoration: "underline",
              textUnderlineOffset: "4px",
            },
          }}
        >
          all
        </Typography>
        {allTags.map((tag: any) => (
          <Typography
            key={tag.id}
            onClick={() =>
              setActiveTagId((prev) => (prev === tag.id ? null : tag.id))
            }
            sx={{
              cursor: "pointer",
              fontWeight: activeTagId === tag.id ? "bold" : "normal",
              textDecoration: activeTagId === tag.id ? "underline" : "none",
              textUnderlineOffset: "4px",
              opacity: activeTagId === tag.id ? 1 : 0.6,
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

      <ContentGridLoader
        contentType={contentType}
        searchQuery={keyword}
        filter={filter}
      />
    </Container>
  );
};

export default SearchView;
