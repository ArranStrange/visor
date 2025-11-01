import React, { useState, useRef, useEffect, useCallback } from "react";
import { Alert, Box } from "@mui/material";
import { useContentType } from "../../context/ContentTypeFilter";
import { usePresetRepository } from "../../core/hooks/useService";
import { useFilmSimRepository } from "../../core/hooks/useService";

import PresetCard from "../cards/PresetCard";
import FilmSimCard from "../cards/FilmSimCard";
import BuyMeACoffeeCard from "./BuyMeACoffeeCard";
import StaggeredGrid from "./StaggeredGrid";

// Content type interfaces
interface ContentItem {
  type: "preset" | "film" | "buymeacoffee";
  data: any;
}

interface ContentGridLoaderProps {
  contentType?: "all" | "presets" | "films";
  filter?: Record<string, any>;
  searchQuery?: string;
  customData?: Array<any>;
  renderItem?: (item: any) => React.ReactNode;
}

const ITEMS_PER_PAGE = 20;

const ContentGridLoader: React.FC<ContentGridLoaderProps> = ({
  contentType = "all",
  filter,
  searchQuery,
  customData,
  renderItem,
}) => {
  // State management - all hooks at the top level
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Refs and external hooks
  const containerRef = useRef<HTMLDivElement>(null);
  const { randomizeOrder } = useContentType();

  // Service hooks
  const presetRepository = usePresetRepository();
  const filmSimRepository = useFilmSimRepository();

  const fetchContentData = useCallback(
    async (page: number, append: boolean = false) => {
      if (customData) {
        const shaped = customData.map((item: any) => {
          if (
            item &&
            typeof item === "object" &&
            "type" in item &&
            "data" in item
          ) {
            return item as ContentItem;
          }
          return { type: "preset" as const, data: item } as ContentItem;
        });
        setContent(shaped);
        setHasMore(false);
        return;
      }

      if (append) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const results: ContentItem[] = [];
        let hasNextPage = false;

        // Fetch presets with pagination
        if (contentType === "all" || contentType === "presets") {
          const paginatedPresets = await presetRepository.findPaginated(
            page,
            ITEMS_PER_PAGE,
            filter
          );
          hasNextPage = paginatedPresets.hasNextPage;

          results.push(
            ...paginatedPresets.presets
              .filter((p: any) => p && p.creator)
              .map((p: any) => ({
                type: "preset" as const,
                data: {
                  ...p,
                  tags: p.tags || [], // Ensure tags is always an array
                },
              }))
          );
        }

        // Fetch film sims with pagination
        if (contentType === "all" || contentType === "films") {
          const paginatedFilmSims = await filmSimRepository.findPaginated(
            page,
            ITEMS_PER_PAGE,
            filter
          );
          hasNextPage = hasNextPage || paginatedFilmSims.hasNextPage;

          results.push(
            ...paginatedFilmSims.filmSims
              .filter((f: any) => f && f.creator)
              .map((f: any) => ({
                type: "film" as const,
                data: {
                  ...f,
                  title: f.name,
                  thumbnail: f.sampleImages?.[0]?.url || "",
                  tags: f.tags || [], // Ensure tags is always an array
                },
              }))
          );
        }

        // Add BuyMeACoffee card only on first page
        if (page === 1 && results.length > 0) {
          const buyMeACoffeeCard: ContentItem = {
            type: "buymeacoffee",
            data: {
              id: "buymeacoffee",
              title: "Buy Me a Coffee",
            },
          };
          results.splice(0, 0, buyMeACoffeeCard);
        }

        // Apply search filter
        const filteredContent = searchQuery
          ? results.filter((item) =>
              item.data.title?.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : results;

        // Update content based on whether we're appending or replacing
        if (append) {
          setContent((prevContent) => [...prevContent, ...filteredContent]);
        } else {
          setContent(filteredContent);
        }

        setHasMore(hasNextPage);
      } catch (err) {
        console.error("Error fetching content:", err);
        setError(err instanceof Error ? err.message : "Failed to load content");
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [
      contentType,
      filter,
      searchQuery,
      customData,
      presetRepository,
      filmSimRepository,
    ]
  );

  // Fetch content on mount and when dependencies change
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    setContent([]);
    fetchContentData(1, false);
  }, [contentType, filter, searchQuery]);

  // Load more function
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchContentData(nextPage, true);
    }
  }, [currentPage, hasMore, isLoadingMore, fetchContentData]);

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  // Empty state
  if (!content.length && !loading) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        No content found. Try adjusting filters or search terms.
      </Alert>
    );
  }

  // Render content
  const renderContentItem = (item: ContentItem, index: number) => {
    if (renderItem) {
      return (
        <React.Fragment key={`${item.type}-${item.data.id}-${index}`}>
          {renderItem(item.data)}
        </React.Fragment>
      );
    }

    if (item.type === "preset") {
      return (
        <PresetCard key={`preset-${item.data.id}-${index}`} {...item.data} />
      );
    }

    if (item.type === "buymeacoffee") {
      return <BuyMeACoffeeCard key={`buymeacoffee-${index}`} />;
    }

    return <FilmSimCard key={`film-${item.data.id}-${index}`} {...item.data} />;
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        maxWidth: "100vw",
        overflow: "hidden",
      }}
    >
      <StaggeredGrid
        key={`grid-${contentType}`}
        loading={false}
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoading={isLoadingMore}
        randomizeOrder={randomizeOrder}
      >
        {content.map((item, index) => renderContentItem(item, index))}
      </StaggeredGrid>
    </Box>
  );
};

export default ContentGridLoader;
