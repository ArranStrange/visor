import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Alert, Box } from "@mui/material";
import { useContentType } from "../../context/ContentTypeFilter";
import { useMobileDetection } from "../../hooks/useMobileDetection";
import { usePresetRepository } from "../../core/hooks/useService";
import { useFilmSimRepository } from "../../core/hooks/useService";

import PresetCard from "../cards/PresetCard";
import FilmSimCard from "../cards/FilmSimCard";
import BuyMeACoffeeCard from "./BuyMeACoffeeCard";
import StaggeredGrid from "./StaggeredGrid";

// Content type interfaces following ISP
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

// Separate data fetching service following SRP
class ContentDataService {
  constructor(private presetRepository: any, private filmSimRepository: any) {}

  async fetchContent(
    contentType: string,
    filter?: any
  ): Promise<ContentItem[]> {
    const results: ContentItem[] = [];

    if (contentType === "all" || contentType === "presets") {
      const presets = await this.presetRepository.findAll(filter);
      results.push(
        ...presets
          .filter((p: any) => p && p.creator)
          .map((p: any) => ({
            type: "preset" as const,
            data: p,
          }))
      );
    }

    if (contentType === "all" || contentType === "films") {
      const filmSims = await this.filmSimRepository.findAll(filter);
      results.push(
        ...filmSims
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

    return results;
  }
}

// Content filtering service following SRP
class ContentFilterService {
  filterBySearch(content: ContentItem[], searchQuery?: string): ContentItem[] {
    if (!searchQuery) return content;

    return content.filter((item) =>
      item.data.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
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
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();
  const { randomizeOrder } = useContentType();

  const presetRepository = usePresetRepository();
  const filmSimRepository = useFilmSimRepository();

  // Initialize services
  const dataService = useMemo(
    () => new ContentDataService(presetRepository, filmSimRepository),
    [presetRepository, filmSimRepository]
  );

  const filterService = useMemo(() => new ContentFilterService(), []);

  // Fetch content
  useEffect(() => {
    const fetchContent = async () => {
      if (customData) {
        setContent(customData.map((item) => ({ type: "preset", data: item })));
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fetchedContent = await dataService.fetchContent(
          contentType,
          filter
        );
        const filteredContent = filterService.filterBySearch(
          fetchedContent,
          searchQuery
        );
        setContent(filteredContent);
      } catch (err) {
        console.error("Error fetching content:", err);
        setError(err instanceof Error ? err.message : "Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [
    contentType,
    filter,
    searchQuery,
    customData,
    dataService,
    filterService,
  ]);

  useEffect(() => {
    setVisibleItems(ITEMS_PER_PAGE);
  }, [content.length]);

  const loadMore = useCallback(() => {
    setVisibleItems((prev) => Math.min(prev + ITEMS_PER_PAGE, content.length));
  }, [content.length]);

  const hasMore = visibleItems < content.length;

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!content.length && !loading) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        No content found. Try adjusting filters or search terms.
      </Alert>
    );
  }

  const visibleData = content.slice(0, visibleItems);

  // Memoize the children to prevent unnecessary re-renders
  const children = useMemo(() => {
    return visibleData.map((item, index) =>
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
  }, [visibleData, renderItem]);

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
        {children}
      </StaggeredGrid>
    </Box>
  );
};

export default ContentGridLoader;
