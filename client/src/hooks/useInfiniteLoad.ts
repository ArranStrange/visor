import { useState, useEffect, useCallback, useRef } from "react";

interface UseInfiniteLoadOptions<T> {
  fetchFn: (page: number) => Promise<{ items: T[]; hasMore: boolean }>;
  resetDeps?: any[]; // Dependencies that trigger reset
  initialLoad?: boolean; // Whether to load on mount (default: true)
}

interface UseInfiniteLoadReturn<T> {
  items: T[];
  loading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  reset: () => void;
}

export function useInfiniteLoad<T>({
  fetchFn,
  resetDeps = [],
  initialLoad = true,
}: UseInfiniteLoadOptions<T>): UseInfiniteLoadReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const fetchFnRef = useRef(fetchFn);

  // Keep fetchFn ref up to date
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  // Load function that handles both initial load and loadMore
  const load = useCallback(
    async (pageNum: number, isAppend: boolean = false) => {
      if (isAppend) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const result = await fetchFnRef.current(pageNum);
        const { items: newItems, hasMore: newHasMore } = result;

        if (isAppend) {
          setItems((prevItems) => [...prevItems, ...newItems]);
        } else {
          setItems(newItems);
        }

        setHasMore(newHasMore);
      } catch (err) {
        console.error("Error in useInfiniteLoad:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  // Load more function
  const loadMore = useCallback(async () => {
    if (!isLoadingMore && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      await load(nextPage, true);
    }
  }, [page, hasMore, isLoadingMore, loading, load]);

  // Reset function
  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setLoading(false);
    setIsLoadingMore(false);
  }, []);

  // Initial load on mount
  useEffect(() => {
    if (initialLoad) {
      reset();
      load(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset and reload when dependencies change
  useEffect(() => {
    if (initialLoad) {
      reset();
      load(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  return {
    items,
    loading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    reset,
  };
}
