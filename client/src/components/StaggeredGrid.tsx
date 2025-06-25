import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Box, CircularProgress } from "@mui/material";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import { useContentType } from "../context/ContentTypeFilter";

interface StaggeredGridProps {
  children: React.ReactNode[];
  minWidth?: number; // min width of card in px (e.g., 250)
  gap?: number; // gap between cards in px (e.g., 16)
  randomizeOrder?: boolean; // whether to randomize the order of items
  loading?: boolean; // whether to show loading skeletons (deprecated)
  onLoadMore?: () => void; // callback to load more items
  hasMore?: boolean; // whether there are more items to load
  isLoading?: boolean; // whether more items are being loaded
}

const StaggeredGrid: React.FC<StaggeredGridProps> = ({
  children,
  minWidth = 200,
  gap = 16,
  loading = false,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}) => {
  const { ref: triggerRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: loadMoreRef, inView: loadMoreInView } = useInView({
    threshold: 0.1,
    rootMargin: "200px", // Increased margin to load earlier
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(() => {
    // Calculate initial column count based on window width
    if (typeof window !== "undefined") {
      const windowWidth = window.innerWidth;
      if (windowWidth < 700) return 2;
      if (windowWidth < 900) return 3;
      return 4;
    }
    return 4; // fallback
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { randomizeOrder, shuffleCounter } = useContentType();

  // Memoize the column count calculation
  const calculateColumnCount = useCallback(
    (containerWidth: number) => {
      if (containerWidth < 700) {
        // Mobile screens: exactly 2 columns
        return 2;
      } else if (containerWidth < 900) {
        // Tablet/Medium screens: 3 columns
        return 3;
      } else {
        // Desktop/Large screens: exactly 4 columns
        return 4;
      }
    },
    [minWidth, gap]
  );

  // Optimized resize handler with debouncing
  const updateColumns = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const newColumnCount = calculateColumnCount(containerWidth);

    // Debug logging
    // console.log(
    //   "Container width:",
    //   containerWidth,
    //   "New column count:",
    //   newColumnCount
    // );

    if (newColumnCount !== columnCount) {
      setColumnCount(newColumnCount);
    }
  }, [calculateColumnCount, columnCount]);

  // Calculate number of columns based on container width
  useEffect(() => {
    // Force immediate calculation on mount
    updateColumns();

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateColumns, 100); // Debounce resize events
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [updateColumns]);

  // Force column calculation on mount and when container ref is available
  useEffect(() => {
    if (containerRef.current) {
      updateColumns();
    }
  }, [updateColumns]);

  // Load more items when intersection observer triggers
  useEffect(() => {
    if (
      loadMoreInView &&
      hasMore &&
      !isLoading &&
      !isLoadingMore &&
      onLoadMore
    ) {
      setIsLoadingMore(true);
      // Use setTimeout to prevent immediate re-triggering
      setTimeout(() => {
        onLoadMore();
        setIsLoadingMore(false);
      }, 100);
    }
  }, [loadMoreInView, hasMore, isLoading, isLoadingMore, onLoadMore]);

  // Memoize column distribution to avoid recalculation on every render
  const columns = useMemo(() => {
    // console.log('StaggeredGrid: Recalculating columns', {
    //   childrenLength: children.length,
    //   columnCount,
    //   randomizeOrder,
    //   shuffleCounter
    // });

    if (!children.length) {
      return Array.from({ length: columnCount }, () => []);
    }

    // Create array of indices
    let itemIndices = Array.from({ length: children.length }, (_, i) => i);

    // Re-enable randomization with truly random shuffle
    if (randomizeOrder) {
      const shuffled = [...itemIndices];

      // Fisher-Yates shuffle with Math.random() for true randomness
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      itemIndices = shuffled;
      // console.log('StaggeredGrid: Shuffled indices', itemIndices);
    }

    const newColumns: number[][] = Array.from(
      { length: columnCount },
      () => []
    );

    // Distribute items across columns
    itemIndices.forEach((itemIndex, index) => {
      const columnIndex = index % columnCount;
      newColumns[columnIndex].push(itemIndex);
    });

    return newColumns;
  }, [children.length, columnCount, randomizeOrder, shuffleCounter]);

  if (!children.length && !loading) {
    return null;
  }

  return (
    <Box>
      <Box ref={triggerRef} sx={{ height: 1 }} />
      <Box
        ref={containerRef}
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
          gap: `${gap}px`,
          alignItems: "start", // Ensure columns start from the top
          minHeight: "100vh", // Prevent layout shift
          contain: "layout", // CSS containment for better performance
          width: "100%", // Ensure container takes full available width
          maxWidth: "100vw", // Prevent overflow on mobile
          overflow: "hidden", // Prevent horizontal scroll
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...({} as any)}
      >
        <AnimatePresence>
          {columns.map((column, columnIndex) => (
            <Box
              key={columnIndex}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: `${gap}px`,
                alignItems: "stretch", // Ensure cards stretch to fill width
              }}
            >
              {column.map((itemIndex) => (
                <motion.div
                  key={`item-${itemIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    inView
                      ? {
                          opacity: 1,
                          y: 0,
                          transition: {
                            delay: 0.01 * itemIndex, // Faster delay
                            duration: 0.3, // Shorter duration
                            ease: "easeOut", // Simpler easing
                          },
                        }
                      : {}
                  }
                  exit={{ opacity: 0, y: -10 }}
                  style={{ width: "100%" }} // Ensure motion.div takes full width
                >
                  {children[itemIndex]}
                </motion.div>
              ))}
            </Box>
          ))}
        </AnimatePresence>
      </Box>

      {/* Load More Trigger */}
      {hasMore && (
        <Box
          ref={loadMoreRef}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 4,
            mt: 2,
            minHeight: 60, // Prevent layout shift
            position: "relative", // Ensure stable positioning
            contain: "layout", // CSS containment
          }}
        >
          {isLoading && (
            <CircularProgress size={24} sx={{ color: "text.secondary" }} />
          )}
        </Box>
      )}
    </Box>
  );
};

export default StaggeredGrid;
