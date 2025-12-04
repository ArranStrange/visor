import { useCallback, useState, useEffect } from "react";
import { DocumentNode, FetchPolicy } from "@apollo/client";
import apolloClient from "@gql/apolloClient";
import { useInfiniteLoad } from "./useInfiniteLoad";

interface UseGraphQLInfiniteLoadOptions<TData, TItem> {
  query: DocumentNode;
  variables?: Record<string, any>; // Variables excluding 'page' and 'limit'
  limit?: number; // Items per page (default: 20)
  extractItems: (data: TData) => TItem[]; // Function to extract items array from GraphQL response
  extractHasMore: (data: TData) => boolean; // Function to extract hasMore boolean from GraphQL response
  extractTotalCount?: (data: TData) => number | undefined; // Optional: extract totalCount from response
  resetDeps?: any[]; // Dependencies that trigger reset
  initialLoad?: boolean; // Whether to load on mount (default: true)
  fetchPolicy?: FetchPolicy; // Apollo fetch policy
}

interface UseGraphQLInfiniteLoadReturn<TItem> {
  items: TItem[];
  loading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  reset: () => void;
  totalCount: number; // Total count from first page
}

/**
 * A hook that combines GraphQL queries with infinite loading.
 * Handles Apollo Client queries internally, eliminating the need to manually create fetchFn.
 *
 * @example
 * const { items, loading, hasMore, loadMore } = useGraphQLInfiniteLoad({
 *   query: BROWSE_USER_LISTS,
 *   variables: { search: debouncedSearch },
 *   limit: 20,
 *   extractItems: (data) => data.browseUserLists.lists,
 *   extractHasMore: (data) => data.browseUserLists.hasNextPage,
 *   extractTotalCount: (data, setTotalCount) => {
 *     setTotalCount(data.browseUserLists.totalCount);
 *   },
 *   resetDeps: [debouncedSearch],
 * });
 */
export function useGraphQLInfiniteLoad<TData, TItem>({
  query,
  variables = {},
  limit = 20,
  extractItems,
  extractHasMore,
  extractTotalCount,
  resetDeps = [],
  initialLoad = true,
  fetchPolicy = "network-only",
}: UseGraphQLInfiniteLoadOptions<
  TData,
  TItem
>): UseGraphQLInfiniteLoadReturn<TItem> {
  const [totalCount, setTotalCount] = useState(0);

  const fetchFn = useCallback(
    async (page: number): Promise<{ items: TItem[]; hasMore: boolean }> => {
      const { data } = await apolloClient.query<TData>({
        query,
        variables: {
          ...variables,
          page,
          limit,
        },
        fetchPolicy,
      });

      // Extract and store totalCount from first page
      if (extractTotalCount && page === 1) {
        const count = extractTotalCount(data);
        if (count !== undefined) {
          setTotalCount(count);
        }
      }

      return {
        items: extractItems(data),
        hasMore: extractHasMore(data),
      };
    },
    [
      query,
      variables,
      limit,
      extractItems,
      extractHasMore,
      extractTotalCount,
      fetchPolicy,
    ]
  );

  const infiniteLoadResult = useInfiniteLoad<TItem>({
    fetchFn,
    resetDeps,
    initialLoad,
  });

  // Reset totalCount when resetDeps change
  useEffect(() => {
    setTotalCount(0);
  }, resetDeps);

  return {
    ...infiniteLoadResult,
    totalCount,
  };
}
