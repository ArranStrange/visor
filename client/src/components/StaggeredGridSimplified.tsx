import React from "react";
import { Box, CircularProgress } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useStaggeredGrid } from "../hooks/useStaggeredGrid";

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

const StaggeredGridSimplified: React.FC<StaggeredGridProps> = ({
  children,
  minWidth = 200,
  gap = 10,
  randomizeOrder = false,
  loading = false,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}) => {
  const {
    containerRef,
    columnCount,
    columns,
    triggerRef,
    inView,
    loadMoreRef,
    isLoadingMore,
  } = useStaggeredGrid({
    children,
    minWidth,
    gap,
    randomizeOrder,
    onLoadMore,
    hasMore,
    isLoading,
  });

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
};

export default StaggeredGridSimplified;
