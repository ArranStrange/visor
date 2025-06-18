import React, { useEffect, useRef, useState } from "react";
import { Box, Skeleton } from "@mui/material";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";

interface StaggeredGridProps {
  children: React.ReactNode[];
  minWidth?: number; // min width of card in px (e.g., 250)
  gap?: number; // gap between cards in px (e.g., 16)
  randomizeOrder?: boolean; // whether to randomize the order of items
  loading?: boolean; // whether to show loading skeletons
}

// Skeleton Card Component
const SkeletonCard: React.FC = () => (
  <Box
    sx={{
      backgroundColor: "background.paper",
      borderRadius: 3,
      overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
      animation: "pulse 2s ease-in-out infinite",
      "@keyframes pulse": {
        "0%": {
          opacity: 0.7,
        },
        "50%": {
          opacity: 1,
        },
        "100%": {
          opacity: 0.7,
        },
      },
    }}
  >
    <Skeleton
      variant="rectangular"
      height={180}
      sx={{ backgroundColor: "rgba(255,255,255,0.1)" }}
    />
    <Box sx={{ p: 2 }}>
      <Skeleton
        variant="text"
        width="80%"
        height={24}
        sx={{ backgroundColor: "rgba(255,255,255,0.1)", mb: 1 }}
      />
      <Skeleton
        variant="text"
        width="100%"
        height={16}
        sx={{ backgroundColor: "rgba(255,255,255,0.1)", mb: 1 }}
      />
      <Skeleton
        variant="text"
        width="60%"
        height={16}
        sx={{ backgroundColor: "rgba(255,255,255,0.1)", mb: 2 }}
      />
      <Box sx={{ display: "flex", gap: 1 }}>
        <Skeleton
          variant="rectangular"
          width={60}
          height={24}
          sx={{ borderRadius: 1, backgroundColor: "rgba(255,255,255,0.1)" }}
        />
        <Skeleton
          variant="rectangular"
          width={50}
          height={24}
          sx={{ borderRadius: 1, backgroundColor: "rgba(255,255,255,0.1)" }}
        />
        <Skeleton
          variant="rectangular"
          width={70}
          height={24}
          sx={{ borderRadius: 1, backgroundColor: "rgba(255,255,255,0.1)" }}
        />
      </Box>
    </Box>
  </Box>
);

const StaggeredGrid: React.FC<StaggeredGridProps> = ({
  children,
  minWidth = 250,
  gap = 16,
  randomizeOrder = true,
  loading = false,
}) => {
  const { ref: triggerRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState<number[][]>([[]]);
  const [columnCount, setColumnCount] = useState(3);
  const [loadedItems, setLoadedItems] = useState<Set<number>>(new Set());

  // Calculate number of columns based on container width
  useEffect(() => {
    if (!containerRef.current) return;

    const updateColumns = () => {
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const newColumnCount = Math.max(
        1,
        Math.floor((containerWidth + gap) / (minWidth + gap))
      );
      setColumnCount(newColumnCount);
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, [minWidth, gap]);

  // Distribute items into columns
  useEffect(() => {
    if (!children.length) {
      setColumns([[]]);
      return;
    }

    // Create array of indices
    let itemIndices = Array.from({ length: children.length }, (_, i) => i);

    // Shuffle the indices if randomizeOrder is true
    if (randomizeOrder) {
      for (let i = itemIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [itemIndices[i], itemIndices[j]] = [itemIndices[j], itemIndices[i]];
      }
    }

    const newColumns: number[][] = Array.from(
      { length: columnCount },
      () => []
    );

    // Distribute items to shortest column
    itemIndices.forEach((itemIndex) => {
      // Find the shortest column
      const shortestColumn = newColumns.reduce(
        (shortest, current, i) =>
          current.length < newColumns[shortest].length ? i : shortest,
        0
      );
      newColumns[shortestColumn].push(itemIndex);
    });

    setColumns(newColumns);
  }, [children, columnCount, randomizeOrder]);

  // Progressive loading effect
  useEffect(() => {
    if (loading || !inView) return;

    const totalItems = children.length;
    const loadInterval = setInterval(() => {
      setLoadedItems((prev) => {
        const newLoaded = new Set(prev);
        if (newLoaded.size < totalItems) {
          newLoaded.add(newLoaded.size);
          return newLoaded;
        }
        clearInterval(loadInterval);
        return prev;
      });
    }, 100); // Load one item every 100ms

    return () => clearInterval(loadInterval);
  }, [children.length, loading, inView]);

  // Reset loaded items when children change
  useEffect(() => {
    setLoadedItems(new Set());
  }, [children]);

  if (!children.length && !loading) {
    return null;
  }

  // Generate skeleton items for loading state
  const skeletonItems = loading ? Array.from({ length: 12 }, (_, i) => i) : [];
  const displayItems = loading ? skeletonItems : children;

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
                alignItems: "stretch", // Ensure cards stretch to fill width
              }}
            >
              {column.map((itemIndex) => {
                const isLoaded = loading || loadedItems.has(itemIndex);
                const shouldShow = loading || isLoaded;

                return (
                  <motion.div
                    key={itemIndex}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={
                      shouldShow && inView
                        ? {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: {
                              delay: loading
                                ? 0.05 * itemIndex
                                : 0.02 * itemIndex,
                              duration: 0.6,
                              ease: [0.25, 0.46, 0.45, 0.94], // Custom easing
                            },
                          }
                        : {}
                    }
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    style={{ width: "100%" }} // Ensure motion.div takes full width
                  >
                    {loading ? <SkeletonCard /> : children[itemIndex]}
                  </motion.div>
                );
              })}
            </Box>
          ))}
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default StaggeredGrid;
