import React, { useState, useEffect } from "react";
import { Box, Container, InputBase, Divider } from "@mui/material";
import { useSearchParams } from "react-router-dom";

import ContentTypeToggle from "../components/ui/ContentTypeToggle";
import ContentGridLoader from "../components/ui/ContentGridLoader";
import TagsList from "../components/ui/TagsList";
import { useContentType } from "../context/ContentTypeFilter";
import { useTags } from "../context/TagContext";

const SearchView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const { contentType } = useContentType();
  const { tags, loading: tagsLoading, searchTags } = useTags();

  // Fetch all tags on mount
  useEffect(() => {
    searchTags();
  }, [searchTags]);

  useEffect(() => {
    const qParam = searchParams.get("q");
    if (qParam) {
      setKeyword(qParam);
    }

    const tagParam = searchParams.get("tag");
    if (tagParam) {
      const tag = tags.find(
        (t) => t.displayName.toLowerCase() === tagParam.toLowerCase()
      );
      if (tag) {
        setActiveTagId(tag.id);
      }
    }
  }, [searchParams, tags]);

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

      <Box sx={{ mb: 2 }}>
        <TagsList
          tags={tags}
          activeTagId={activeTagId}
          onTagClick={handleTagClick}
          onClear={handleClear}
          isLoading={tagsLoading}
        />
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
