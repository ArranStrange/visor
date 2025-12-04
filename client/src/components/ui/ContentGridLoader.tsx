import React, { useRef, useCallback } from "react";
import { Alert, Box } from "@mui/material";
import { useContentType } from "../../context/ContentTypeFilter";
import { useInfiniteLoad } from "../../hooks/useInfiniteLoad";
import { GET_ALL_PRESETS } from "../../graphql/queries/getAllPresets";
import { GET_ALL_FILMSIMS } from "../../graphql/queries/getAllFilmSims";
import apolloClient from "@gql/apolloClient";

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

const ITEMS_PER_PAGE = 3;

const ContentGridLoader: React.FC<ContentGridLoaderProps> = ({
  contentType: contentTypeProp,
  filter,
  searchQuery,
  customData,
  renderItem,
}) => {
  // Refs and external hooks
  const containerRef = useRef<HTMLDivElement>(null);
  const { contentType: contextContentType } = useContentType();

  // Use prop if provided, otherwise fall back to context
  const contentType = contentTypeProp ?? contextContentType;

  // Create fetch function for useInfiniteLoad using GraphQL queries directly
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

      // Fetch data in parallel using GraphQL queries directly
      const fetchPromises: Promise<any>[] = [];

      if (shouldFetchPresets) {
        fetchPromises.push(
          apolloClient.query({
            query: GET_ALL_PRESETS,
            variables: {
              page,
              limit: ITEMS_PER_PAGE,
              filter,
            },
            fetchPolicy: "network-only",
          })
        );
      }

      if (shouldFetchFilms) {
        fetchPromises.push(
          apolloClient.query({
            query: GET_ALL_FILMSIMS,
            variables: {
              page,
              limit: ITEMS_PER_PAGE,
              filter,
            },
            fetchPolicy: "network-only",
          })
        );
      }

      // Execute all fetches in parallel
      const fetchResults = await Promise.all(fetchPromises);

      // Process preset results
      if (shouldFetchPresets) {
        const presetData = fetchResults[0].data?.listPresets;
        if (presetData) {
          hasNextPage = presetData.hasNextPage;

          results.push(
            ...presetData.presets
              .filter((p: any) => p && p.creator)
              .map((p: any) => ({
                type: "preset" as const,
                data: {
                  ...p,
                  tags: p.tags || [],
                },
              }))
          );
        }
      }

      // Process film sim results
      if (shouldFetchFilms) {
        const filmResultIndex = shouldFetchPresets ? 1 : 0;
        const filmData = fetchResults[filmResultIndex].data?.listFilmSims;
        if (filmData) {
          hasNextPage = hasNextPage || filmData.hasNextPage;

          results.push(
            ...filmData.filmSims
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
    [contentType, filter, searchQuery, customData]
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
        // randomizeOrder={randomizeOrder}
      >
        {items.map((item, index) => renderContentItem(item, index))}
      </StaggeredGrid>
    </Box>
  );
};

export default ContentGridLoader;
