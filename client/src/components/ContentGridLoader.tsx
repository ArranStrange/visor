import React, { useMemo, useState, useCallback, useRef } from "react";
import { useQuery } from "@apollo/client";
import { CircularProgress, Alert, Box } from "@mui/material";
import { useContentType } from "../context/ContentTypeFilter";

import { GET_ALL_PRESETS } from "../graphql/queries/getAllPresets";
import { GET_ALL_FILMSIMS } from "../graphql/queries/getAllFilmSims";

import PresetCard from "./PresetCard";
import FilmSimCard from "./FilmSimCard";
import BuyMeACoffeeCard from "./BuyMeACoffeeCard";
import StaggeredGrid from "./StaggeredGrid";

interface ContentGridLoaderProps {
  contentType?: "all" | "presets" | "films";
  filter?: Record<string, any>;
  searchQuery?: string;
  customData?: Array<any>;
  renderItem?: (item: any) => React.ReactNode;
}

const ITEMS_PER_PAGE = 10;

const ContentGridLoader: React.FC<ContentGridLoaderProps> = ({
  contentType = "all",
  filter,
  searchQuery,
  customData,
  renderItem,
}) => {
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const { randomizeOrder } = useContentType();

  const {
    data: presetData,
    loading: loadingPresets,
    error: presetError,
  } = useQuery(GET_ALL_PRESETS, {
    variables: { filter },
    skip: !!customData,
    fetchPolicy: "cache-and-network",
  });

  const {
    data: filmSimData,
    loading: loadingFilmSims,
    error: filmSimError,
  } = useQuery(GET_ALL_FILMSIMS, {
    variables: { filter },
    skip: !!customData,
    fetchPolicy: "cache-and-network",
  });

  const isLoading = loadingPresets || loadingFilmSims;
  const isError = presetError || filmSimError;

  const combined = useMemo(() => {
    if (customData) {
      return customData;
    }

    const results: { type: "preset" | "film" | "buymeacoffee"; data: any }[] =
      [];

    if (
      (contentType === "all" || contentType === "presets") &&
      presetData?.listPresets
    ) {
      results.push(
        ...presetData.listPresets
          .filter((p: any) => p && p.creator)
          .map((p: any) => ({
            type: "preset" as const,
            data: p,
          }))
      );
    }

    if (
      (contentType === "all" || contentType === "films") &&
      filmSimData?.listFilmSims
    ) {
      results.push(
        ...filmSimData.listFilmSims
          .filter((f: any) => f && f.creator)
          .map((f: any) => ({
            type: "film" as const,
            data: {
              ...f,
              title: f.name,
              thumbnail: f.sampleImages?.[0]?.url || "",
              tags: f.tags || [],
            },
          }))
      );
    }

    // Add Buy Me a Coffee card at specific position
    const buyMeACoffeeCard = {
      type: "buymeacoffee" as const,
      data: {
        id: "buymeacoffee",
        title: "Buy Me a Coffee",
      },
    };

    // Always insert at position 0 (first card) to ensure it's on the top row
    // This works regardless of mobile/desktop and ensures it stays in the first few positions even after shuffling
    if (results.length > 0) {
      results.splice(0, 0, buyMeACoffeeCard);
    } else {
      // If no other items, add to the beginning
      results.unshift(buyMeACoffeeCard);
    }

    return searchQuery
      ? results.filter((item) =>
          item.data.title?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : results;
  }, [customData, contentType, presetData, filmSimData, searchQuery, isMobile]);

  // Reset visible items when data changes
  React.useEffect(() => {
    setVisibleItems(ITEMS_PER_PAGE);
  }, [combined.length]);

  // Load more items when intersection observer triggers
  const loadMore = useCallback(() => {
    setVisibleItems((prev) => Math.min(prev + ITEMS_PER_PAGE, combined.length));
  }, [combined.length]);

  // Check if we have more items to load
  const hasMore = visibleItems < combined.length;

  // Check if we're on mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(hover: none)").matches);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isError) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {presetError?.message ||
          filmSimError?.message ||
          "Failed to load content"}
      </Alert>
    );
  }

  if (!combined.length && !isLoading) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        No content found. Try adjusting filters or search terms.
      </Alert>
    );
  }

  const visibleData = combined.slice(0, visibleItems);
  const children = visibleData.map((item, index) =>
    renderItem ? (
      <React.Fragment key={`${item.type}-${item.data.id}-${index}`}>
        {renderItem(item.data)}
      </React.Fragment>
    ) : item.type === "preset" ? (
      <PresetCard key={`preset-${item.data.id}-${index}`} {...item.data} />
    ) : item.type === "buymeacoffee" ? (
      <BuyMeACoffeeCard key={`buymeacoffee-${index}`} />
    ) : (
      <FilmSimCard key={`film-${item.data.id}-${index}`} {...item.data} />
    )
  );

  return (
    <Box
      data-cy="content-grid"
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
        isLoading={isLoading}
        randomizeOrder={randomizeOrder}
      >
        {children}
      </StaggeredGrid>
    </Box>
  );
};

export default ContentGridLoader;
