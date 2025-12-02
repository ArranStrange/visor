import React, { useRef, useCallback } from "react";
import { Alert, Box } from "@mui/material";
import { useContentType } from "../../context/ContentTypeFilter";
import { usePresetRepository } from "../../core/hooks/useService";
import { useFilmSimRepository } from "../../core/hooks/useService";
import { useInfiniteLoad } from "../../hooks/useInfiniteLoad";

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

const ITEMS_PER_PAGE = 10;

const ContentGridLoader: React.FC<ContentGridLoaderProps> = ({
  contentType: contentTypeProp,
  filter,
  searchQuery,
  customData,
  renderItem,
}) => {
  // Refs and external hooks
  const containerRef = useRef<HTMLDivElement>(null);
  const { randomizeOrder, contentType: contextContentType } = useContentType();

  // Use prop if provided, otherwise fall back to context
  const contentType = contentTypeProp ?? contextContentType;

  // Service hooks
  const presetRepository = usePresetRepository();
  const filmSimRepository = useFilmSimRepository();

  // Create fetch function for useInfiniteLoad
  const fetchFn = useCallback(
    async (
      page: number
    ): Promise<{ items: ContentItem[]; hasMore: boolean }> => {
      // Handle customData case
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
        return { items: shaped, hasMore: false };
      }

      const results: ContentItem[] = [];
      let hasNextPage = false;

      // Determine what to fetch based on contentType
      const shouldFetchPresets =
        contentType === "all" || contentType === "presets";
      const shouldFetchFilms = contentType === "all" || contentType === "films";

      // Fetch data in parallel when both are needed, or sequentially when only one is needed
      const fetchPromises: Promise<any>[] = [];

      if (shouldFetchPresets) {
        fetchPromises.push(
          presetRepository.findPaginated(page, ITEMS_PER_PAGE, filter)
        );
      }

      if (shouldFetchFilms) {
        fetchPromises.push(
          filmSimRepository.findPaginated(page, ITEMS_PER_PAGE, filter)
        );
      }

      // Execute all fetches in parallel
      const fetchResults = await Promise.all(fetchPromises);

      // Process preset results
      if (shouldFetchPresets) {
        const paginatedPresets = fetchResults[0];
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

      // Process film sim results
      if (shouldFetchFilms) {
        const filmResultIndex = shouldFetchPresets ? 1 : 0;
        const paginatedFilmSims = fetchResults[filmResultIndex];
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

      return { items: filteredContent, hasMore: hasNextPage };
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

  // Use infinite load hook
  const { items, loading, isLoadingMore, hasMore, error, loadMore } =
    useInfiniteLoad<ContentItem>({
      fetchFn,
      resetDeps: [contentType, filter, searchQuery],
      initialLoad: true,
    });

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  // Empty state
  if (!items.length && !loading) {
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
        {items.map((item, index) => renderContentItem(item, index))}
      </StaggeredGrid>
    </Box>
  );
};

export default ContentGridLoader;
