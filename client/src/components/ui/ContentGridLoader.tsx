import React, { useState, useRef, useEffect, useCallback } from "react";
import { Alert, Box } from "@mui/material";
import { useContentType } from "../../context/ContentTypeFilter";
import { useMobileDetection } from "../../hooks/useMobileDetection";
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

const ITEMS_PER_PAGE = 10;

const ContentGridLoader: React.FC<ContentGridLoaderProps> = ({
  contentType = "all",
  filter,
  searchQuery,
  customData,
  renderItem,
}) => {
  // State management - all hooks at the top level
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs and external hooks
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();
  const { randomizeOrder } = useContentType();

  // Service hooks
  const presetRepository = usePresetRepository();
  const filmSimRepository = useFilmSimRepository();

  // Data fetching function - moved outside of useEffect to avoid dependency issues
  const fetchContentData = useCallback(async () => {
    if (customData) {
      setContent(customData.map((item) => ({ type: "preset", data: item })));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results: ContentItem[] = [];

      // Fetch presets
      if (contentType === "all" || contentType === "presets") {
        const presets = await presetRepository.findAll(filter);
        results.push(
          ...presets
            .filter((p: any) => p && p.creator)
            .filter((p: any) => {
              // Apply tag filter if provided
              if (filter?.tagId) {
                return p.tags?.some((tag: any) => tag.id === filter.tagId);
              }
              return true;
            })
            .map((p: any) => ({
              type: "preset" as const,
              data: {
                ...p,
                tags: p.tags || [], // Ensure tags is always an array
              },
            }))
        );
      }

      // Fetch film sims
      if (contentType === "all" || contentType === "films") {
        const filmSims = await filmSimRepository.findAll(filter);
        results.push(
          ...filmSims
            .filter((f: any) => f && f.creator)
            .filter((f: any) => {
              // Apply tag filter if provided
              if (filter?.tagId) {
                return f.tags?.some((tag: any) => tag.id === filter.tagId);
              }
              return true;
            })
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

      // Add BuyMeACoffee card
      const buyMeACoffeeCard: ContentItem = {
        type: "buymeacoffee",
        data: {
          id: "buymeacoffee",
          title: "Buy Me a Coffee",
        },
      };

      if (results.length > 0) {
        results.splice(0, 0, buyMeACoffeeCard);
      } else {
        results.unshift(buyMeACoffeeCard);
      }

      // Apply search filter
      const filteredContent = searchQuery
        ? results.filter((item) =>
            item.data.title?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : results;

      setContent(filteredContent);
    } catch (err) {
      console.error("Error fetching content:", err);
      setError(err instanceof Error ? err.message : "Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [
    contentType,
    filter,
    searchQuery,
    customData,
    presetRepository,
    filmSimRepository,
  ]);

  // Fetch content on mount and when dependencies change
  useEffect(() => {
    fetchContentData();
  }, [fetchContentData]);

  // Reset visible items when content changes
  useEffect(() => {
    setVisibleItems(ITEMS_PER_PAGE);
  }, [content.length]);

  // Load more function
  const loadMore = useCallback(() => {
    setVisibleItems((prev) => Math.min(prev + ITEMS_PER_PAGE, content.length));
  }, [content.length]);

  const hasMore = visibleItems < content.length;

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
      <Alert severity="info" sx={{ my: 2 }}>
        No content found. Try adjusting filters or search terms.
      </Alert>
    );
  }

  // Render content
  const visibleData = content.slice(0, visibleItems);

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
        isLoading={loading}
        randomizeOrder={randomizeOrder}
      >
        {visibleData.map((item, index) => renderContentItem(item, index))}
      </StaggeredGrid>
    </Box>
  );
};

export default ContentGridLoader;
