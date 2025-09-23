import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  memo,
} from "react";
import { Box, CircularProgress } from "@mui/material";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import { useContentType } from "../../context/ContentTypeFilter";

interface StaggeredGridProps {
  children: React.ReactNode[];
  minWidth?: number;
  gap?: number;
  randomizeOrder?: boolean;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

const StaggeredGrid: React.FC<StaggeredGridProps> = memo(
  ({
    children,
    minWidth = 200,
    gap = 10,
    randomizeOrder = false,
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
      rootMargin: "200px",
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const [columnCount, setColumnCount] = useState(() => {
      if (typeof window !== "undefined") {
        const windowWidth = window.innerWidth;
        if (windowWidth < 700) return 2;
        if (windowWidth < 900) return 4;
        return 5;
      }
      return 4;
    });
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const { shuffleCounter } = useContentType();

    const shuffledOrderRef = useRef<number[]>([]);
    const lastShuffleCounterRef = useRef<number>(shuffleCounter);

    const calculateColumnCount = useCallback(
      (containerWidth: number) => {
        if (containerWidth < 700) {
          return 2;
        } else if (containerWidth < 900) {
          return 3;
        } else {
          return 4;
        }
      },
      [minWidth, gap]
    );

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

    useEffect(() => {
      updateColumns();

      let timeoutId: number;
      const handleResize = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(updateColumns, 100);
      };

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        clearTimeout(timeoutId);
      };
    }, [updateColumns]);

    useEffect(() => {
      if (containerRef.current) {
        updateColumns();
      }
    }, [updateColumns]);

    useEffect(() => {
      if (containerRef.current) {
        setTimeout(() => {
          updateColumns();
        }, 50);
      }
    }, [children.length, updateColumns]);

    useEffect(() => {
      if (
        loadMoreInView &&
        hasMore &&
        !isLoading &&
        !isLoadingMore &&
        onLoadMore
      ) {
        setIsLoadingMore(true);

        setTimeout(() => {
          onLoadMore();
          setIsLoadingMore(false);
        }, 100);
      }
    }, [loadMoreInView, hasMore, isLoading, isLoadingMore, onLoadMore]);

    const columns = useMemo(() => {
      // console.log('StaggeredGrid: Recalculating columns', {
      //   childrenLength: children.length,
      //   columnCount,
      //   randomizeOrder,
      //   shuffleCounter,
      //   lastShuffleCounter: lastShuffleCounterRef.current
      // });

      if (!children.length) {
        return Array.from({ length: columnCount }, () => []);
      }

      let itemIndices = Array.from({ length: children.length }, (_, i) => i);

      if (randomizeOrder) {
        const chunkSize = 10;
        const shuffled: number[] = [];

        for (
          let chunkStart = 0;
          chunkStart < children.length;
          chunkStart += chunkSize
        ) {
          const chunkEnd = Math.min(chunkStart + chunkSize, children.length);
          const chunkIndices = Array.from(
            { length: chunkEnd - chunkStart },
            (_, i) => chunkStart + i
          );

          const storedChunk = shuffledOrderRef.current.slice(
            chunkStart,
            chunkEnd
          );

          if (storedChunk.length === chunkIndices.length) {
            shuffled.push(...storedChunk);
          } else {
            const shuffledChunk = [...chunkIndices];

            for (let i = shuffledChunk.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffledChunk[i], shuffledChunk[j]] = [
                shuffledChunk[j],
                shuffledChunk[i],
              ];
            }

            shuffled.push(...shuffledChunk);
          }
        }

        itemIndices = shuffled;
        shuffledOrderRef.current = shuffled;
        lastShuffleCounterRef.current = shuffleCounter;
        // console.log('StaggeredGrid: New shuffled indices with chunk preservation', itemIndices);
      } else {
        // console.log('Shuffle disabled, using original order');

        shuffledOrderRef.current = [];
        lastShuffleCounterRef.current = shuffleCounter;
      }

      const newColumns: number[][] = Array.from(
        { length: columnCount },
        () => []
      );

      itemIndices.forEach((itemIndex, index) => {
        const columnIndex = index % columnCount;
        newColumns[columnIndex].push(itemIndex);
      });

      return newColumns;
    }, [children.length, columnCount, randomizeOrder, shuffleCounter]);

    useEffect(() => {
      if (!randomizeOrder) {
        shuffledOrderRef.current = [];
        lastShuffleCounterRef.current = shuffleCounter;
      }
    }, [randomizeOrder, shuffleCounter]);

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
            alignItems: "start",
            minHeight: "100vh",
            contain: "layout",
            width: "100%",
            maxWidth: "100vw",
            overflow: "hidden",
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
                  alignItems: "stretch",
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
                              delay: 0.01 * itemIndex,
                              duration: 0.3,
                              ease: "easeOut",
                            },
                          }
                        : {}
                    }
                    exit={{ opacity: 0, y: -10 }}
                    style={{ width: "100%" }}
                  >
                    {children[itemIndex]}
                  </motion.div>
                ))}
              </Box>
            ))}
          </AnimatePresence>
        </Box>

        {hasMore && (
          <Box
            ref={loadMoreRef}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 4,
              mt: 2,
              minHeight: 60,
              position: "relative",
              contain: "layout",
            }}
          >
            {isLoading && (
              <CircularProgress size={24} sx={{ color: "text.secondary" }} />
            )}
          </Box>
        )}
      </Box>
    );
  }
);

StaggeredGrid.displayName = "StaggeredGrid";

export default StaggeredGrid;
