import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

interface UseInfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore?: () => void;
}

export const useInfiniteScroll = ({
  hasMore,
  isLoading,
  onLoadMore,
}: UseInfiniteScrollProps) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { ref: triggerRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: loadMoreRef, inView: loadMoreInView } = useInView({
    threshold: 0.1,
    rootMargin: "200px",
  });

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

  return {
    triggerRef,
    inView,
    loadMoreRef,
    isLoadingMore,
  };
};
