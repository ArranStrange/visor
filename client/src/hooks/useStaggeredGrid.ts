import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useContentType } from "../context/ContentTypeFilter";
import { calculateColumnCount, shuffleArrayInChunks, distributeItemsAcrossColumns } from "../utils/gridUtils";

interface UseStaggeredGridProps {
  children: React.ReactNode[];
  minWidth?: number;
  gap?: number;
  randomizeOrder?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

export const useStaggeredGrid = ({
  children,
  minWidth = 200,
  gap = 10,
  randomizeOrder = false,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}: UseStaggeredGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(() => {
    if (typeof window !== "undefined") {
      return calculateColumnCount(window.innerWidth);
    }
    return 4;
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { shuffleCounter } = useContentType();
  const shuffledOrderRef = useRef<number[]>([]);
  const lastShuffleCounterRef = useRef<number>(shuffleCounter);

  const { ref: triggerRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: loadMoreRef, inView: loadMoreInView } = useInView({
    threshold: 0.1,
    rootMargin: "200px",
  });

  const updateColumns = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const newColumnCount = calculateColumnCount(containerWidth);

    if (newColumnCount !== columnCount) {
      setColumnCount(newColumnCount);
    }
  }, [columnCount]);

  // Handle resize events
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

  // Update columns when container changes
  useEffect(() => {
    if (containerRef.current) {
      updateColumns();
    }
  }, [updateColumns]);

  // Update columns when children change
  useEffect(() => {
    if (containerRef.current) {
      setTimeout(() => {
        updateColumns();
      }, 50);
    }
  }, [children.length, updateColumns]);

  // Handle load more functionality
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

  // Calculate columns with items
  const columns = useMemo(() => {
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
          const shuffledChunk = shuffleArrayInChunks(chunkIndices, chunkSize);
          shuffled.push(...shuffledChunk);
        }
      }

      itemIndices = shuffled;
      shuffledOrderRef.current = shuffled;
      lastShuffleCounterRef.current = shuffleCounter;
    } else {
      shuffledOrderRef.current = [];
      lastShuffleCounterRef.current = shuffleCounter;
    }

    return distributeItemsAcrossColumns(itemIndices, columnCount);
  }, [children.length, columnCount, randomizeOrder, shuffleCounter]);

  // Reset shuffle when randomizeOrder changes
  useEffect(() => {
    if (!randomizeOrder) {
      shuffledOrderRef.current = [];
      lastShuffleCounterRef.current = shuffleCounter;
    }
  }, [randomizeOrder, shuffleCounter]);

  return {
    containerRef,
    columnCount,
    columns,
    triggerRef,
    inView,
    loadMoreRef,
    isLoadingMore,
  };
};
