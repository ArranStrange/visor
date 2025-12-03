import React, { useState, useEffect } from "react";
import { Container } from "@mui/material";
import { useSearchParams } from "react-router-dom";

import ContentGridLoader from "components/ui/ContentGridLoader";
import { useContentType } from "context/ContentTypeFilter";
import { useTags } from "context/TagContext";
import {
  SearchFilters,
  SearchResultsHeader,
  PageBreadcrumbs,
} from "lib/slots/slot-definitions";
import SearchBreadcrumb from "./search.runtime";

const SearchView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const { contentType } = useContentType();
  const { tags, loading: tagsLoading, searchTags } = useTags();

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    // Debounced update is handled by DebouncedTextField
  };

  const handleDebouncedKeywordChange = (value: string) => {
    setDebouncedKeyword(value);
  };

  // Fetch all tags on mount
  useEffect(() => {
    searchTags();
  }, [searchTags]);

  useEffect(() => {
    const qParam = searchParams.get("q");
    if (qParam) {
      setKeyword(qParam);
      setDebouncedKeyword(qParam);
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
    setDebouncedKeyword("");
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
      <SearchBreadcrumb />
      <PageBreadcrumbs.Slot />
      {/* Search results header - plugins can inject search input and filters */}
      <SearchResultsHeader.Slot
        keyword={keyword}
        debouncedKeyword={debouncedKeyword}
        onKeywordChange={handleKeywordChange}
        onDebouncedKeywordChange={handleDebouncedKeywordChange}
      />

      {/* Search filters - plugins can inject filter components */}
      <SearchFilters.Slot
        tags={tags}
        activeTagId={activeTagId}
        onTagClick={handleTagClick}
        onClear={handleClear}
        tagsLoading={tagsLoading}
      />

      <ContentGridLoader
        contentType={contentType}
        searchQuery={debouncedKeyword}
        filter={activeTagId ? { tagId: activeTagId } : undefined}
      />
    </Container>
  );
};

export default SearchView;
