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
  randomizeOrder = true,
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
  const [columnCount, setColumnCount] = useState(4); // Start with 4 for desktop
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Memoize the column count calculation
  const calculateColumnCount = useCallback(
    (containerWidth: number) => {
      if (containerWidth < 768) {
        // Mobile screens: minimum 2 columns, max 3
        const calculatedColumns = Math.max(
          2,
          Math.floor((containerWidth + gap) / (minWidth + gap))
        );
        return Math.min(calculatedColumns, 3); // Cap at 3 for mobile
      } else if (containerWidth < 1200) {
        // Tablet/Medium screens: minimum 3 columns, max 4
        const calculatedColumns = Math.max(
          3,
          Math.floor((containerWidth + gap) / (minWidth + gap))
        );
        return Math.min(calculatedColumns, 4); // Cap at 4 for tablet
      } else {
        // Desktop/Large screens: minimum 4 columns, no max
        const calculatedColumns = Math.max(
          4,
          Math.floor((containerWidth + gap) / (minWidth + gap))
        );
        // Ensure we get at least 4 columns on desktop, even if calculation suggests fewer
        return Math.max(calculatedColumns, 4);
      }
    },
    [minWidth, gap]
  );

  // Optimized resize handler with debouncing
  const updateColumns = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const newColumnCount = calculateColumnCount(containerWidth);

    if (newColumnCount !== columnCount) {
      setColumnCount(newColumnCount);
    }
  }, [calculateColumnCount, columnCount]);

  // Calculate number of columns based on container width
  useEffect(() => {
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
    if (!children.length) {
      return Array.from({ length: columnCount }, () => []);
    }

    // Create array of indices
    let itemIndices = Array.from({ length: children.length }, (_, i) => i);

    // Temporarily disable randomization to prevent layout shifts
    // if (randomizeOrder) {
    //   // Use a more efficient shuffle algorithm
    //   for (let i = itemIndices.length - 1; i > 0; i--) {
    //     const j = Math.floor(Math.random() * (i + 1));
    //     [itemIndices[i], itemIndices[j]] = [itemIndices[j], itemIndices[i]];
    //   }
    // }

    const newColumns: number[][] = Array.from(
      { length: columnCount },
      () => []
    );

    // Consistent distribution: always distribute items in the same order
    itemIndices.forEach((itemIndex, index) => {
      const columnIndex = index % columnCount;
      newColumns[columnIndex].push(itemIndex);
    });

    return newColumns;
  }, [children.length, columnCount, randomizeOrder]);

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
        }}
      >
        <AnimatePresence mode="wait">
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
