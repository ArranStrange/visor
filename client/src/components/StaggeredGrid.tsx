import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";

interface StaggeredGridProps {
  children: React.ReactNode[];
  minWidth?: number; // min width of card in px (e.g., 250)
  gap?: number; // gap between cards in px (e.g., 16)
}

const StaggeredGrid: React.FC<StaggeredGridProps> = ({
  children,
  minWidth = 250,
  gap = 16,
}) => {
  const { ref: triggerRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState<number[][]>([[]]);
  const [columnCount, setColumnCount] = useState(3);

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

    const newColumns: number[][] = Array.from(
      { length: columnCount },
      () => []
    );

    children.forEach((_, index) => {
      // Find the shortest column
      const shortestColumn = newColumns.reduce(
        (shortest, current, i) =>
          current.length < newColumns[shortest].length ? i : shortest,
        0
      );
      newColumns[shortestColumn].push(index);
    });

    setColumns(newColumns);
  }, [children, columnCount]);

  if (!children.length) {
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
              {column.map((itemIndex) => (
                <motion.div
                  key={itemIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    inView
                      ? {
                          opacity: 1,
                          y: 0,
                          transition: {
                            delay: 0.03 * itemIndex,
                            duration: 0.4,
                            ease: "easeOut",
                          },
                        }
                      : {}
                  }
                  exit={{ opacity: 0 }}
                  style={{ width: "100%" }} // Ensure motion.div takes full width
                >
                  {children[itemIndex]}
                </motion.div>
              ))}
            </Box>
          ))}
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default StaggeredGrid;
