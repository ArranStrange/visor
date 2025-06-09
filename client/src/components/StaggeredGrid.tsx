import React from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";

interface StaggeredGridProps {
  children: React.ReactNode[];
  columns?: { xs: number; sm?: number; md: number };
  gap?: number;
  offset?: number;
}

const StaggeredGrid: React.FC<StaggeredGridProps> = ({
  children,
  columns = { xs: 2, sm: 3, md: 4 },
  gap = { xs: 1, sm: 2, md: 4 },
  offset = 32,
}) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  const columnCount = isMdUp
    ? columns.md
    : isSmUp && columns.sm
    ? columns.sm
    : columns.xs;

  const { ref: triggerRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <Box>
      <Box ref={triggerRef} sx={{ height: 1 }} />
      <Box
        sx={{
          columnCount: columnCount,
          columnGap: gap,
        }}
      >
        <AnimatePresence>
          {children.map((child, index) => {
            const isEvenColumn = (index % columnCount) % 2 === 1;
            const isBelowFirstRow = index >= columnCount;
            const shouldOffset = isEvenColumn && isBelowFirstRow;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={
                  inView
                    ? {
                        opacity: 1,
                        y: 0,
                        transition: {
                          delay: 0.03 * index,
                          duration: 0.4,
                          ease: "easeOut",
                        },
                      }
                    : {}
                }
                exit={{ opacity: 0 }}
                style={{
                  breakInside: "avoid",
                  marginBottom: theme.spacing(2),
                  marginTop: shouldOffset ? offset : 0,
                  width: "100%",
                }}
              >
                {child}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default StaggeredGrid;
