import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  InputBase,
  CircularProgress,
  Alert,
  Button,
  Stack,
} from "@mui/material";
import { useQuery } from "@apollo/client";
import { BROWSE_USER_LISTS } from "../graphql/queries/browseUserLists";
import ListRow from "../components/lists/ListRow";
import TagsList from "../components/ui/TagsList";
import SearchIcon from "@mui/icons-material/Search";
import { useTags } from "../context/TagContext";

interface UserList {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    username: string;
    avatar?: string;
  };
  presets: Array<{
    id: string;
    title: string;
    slug: string;
    afterImage?: {
      id: string;
      url: string;
    };
    tags?: Array<{
      id: string;
      name: string;
      displayName: string;
    }>;
  }>;
  filmSims: Array<{
    id: string;
    name: string;
    slug: string;
    sampleImages?: Array<{
      id: string;
      url: string;
    }>;
  }>;
}

interface BrowseUserListsData {
  browseUserLists: {
    lists: UserList[];
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

const BrowseLists: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;
  const { tags, loading: tagsLoading, searchTags } = useTags();

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch all tags on mount
  useEffect(() => {
    searchTags();
  }, [searchTags]);

  const activeTagDisplayName = useMemo(() => {
    return tags.find((tag) => tag.id === activeTagId)?.displayName || null;
  }, [activeTagId, tags]);

  useEffect(() => {
    // When selecting a tag, drive the search term with the tag's display name
    if (activeTagDisplayName) {
      setSearchQuery(activeTagDisplayName);
    }
  }, [activeTagDisplayName]);

  const handleClear = () => {
    setSearchQuery("");
    setActiveTagId(null);
  };

  const handleTagClick = (tagId: string, _tagDisplayName: string) => {
    const newActive = activeTagId === tagId ? null : tagId;
    setActiveTagId(newActive);
    if (!newActive) {
      // If unselecting tag, keep current text as is, user can type
      setSearchQuery("");
    }
  };

  const { data, loading, error } = useQuery<BrowseUserListsData>(
    BROWSE_USER_LISTS,
    {
      variables: {
        search: debouncedSearch || undefined,
        page,
        limit,
      },
      fetchPolicy: "cache-and-network",
    }
  );

  const handleLoadMore = useCallback(() => {
    if (data?.browseUserLists.hasNextPage) {
      setPage((prev) => prev + 1);
    }
  }, [data?.browseUserLists.hasNextPage]);

  const lists = data?.browseUserLists.lists || [];
  const totalCount = data?.browseUserLists.totalCount || 0;
  const hasNextPage = data?.browseUserLists.hasNextPage || false;

  return (
    <Container maxWidth="lg" sx={{ py: 4, mb: 20 }}>
      <InputBase
        placeholder="Search presets, film sims, tags…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        startAdornment={
          <SearchIcon
            sx={{
              ml: 2,
              mr: 1,
              color: "text.secondary",
            }}
          />
        }
        sx={{
          px: 2,
          py: 1.5,
          borderRadius: 6,
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.04)",
          transition: "all 0.2s",
        }}
      />

      <Box sx={{ mb: 2, mt: 2 }}>
        <TagsList
          tags={tags}
          activeTagId={activeTagId}
          onTagClick={handleTagClick}
          onClear={handleClear}
          isLoading={tagsLoading}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading lists: {error.message}
        </Alert>
      )}

      {!loading && lists.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            {debouncedSearch
              ? "No lists found matching your search"
              : "No public lists available yet"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {debouncedSearch
              ? "Try a different search term"
              : "Be the first to create and share a public list!"}
          </Typography>
        </Box>
      )}

      {lists.length > 0 && (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {totalCount} {totalCount === 1 ? "list" : "lists"} found
              {debouncedSearch && ` for "${debouncedSearch}"`}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 4, mb: 4 }}>
            {lists.map((list) => (
              <ListRow
                key={list.id}
                id={list.id}
                name={list.name}
                description={list.description}
                owner={list.owner}
                isFeatured={list.isFeatured || false}
                presets={list.presets}
                filmSims={list.filmSims}
              />
            ))}
          </Box>

          {hasNextPage && (
            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleLoadMore}
                disabled={loading}
                size="large"
                sx={{ minWidth: 200 }}
              >
                {loading ? <CircularProgress size={24} /> : "Load More Lists"}
              </Button>
            </Stack>
          )}
        </>
      )}

      {loading && lists.length === 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};

export default BrowseLists;
