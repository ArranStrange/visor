import type { Reference, StoreObject, TypePolicies } from "@apollo/client";

interface PaginationArguments {
  page?: number;
  limit?: number;
}

interface PaginationMetadata {
  __typename?: string;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage?: boolean;
  currentPage: number;
  totalPages: number;
}

type CacheItem = Reference | StoreObject;
type PaginatedConnection<TKey extends string> = PaginationMetadata &
  Record<TKey, readonly CacheItem[]>;

const DEFAULT_PAGE_SIZE = 20;

export const paginationTypePolicies: TypePolicies = {
  Query: {
    fields: {
      listPresets: createPaginatedFieldPolicy("presets"),
      listFilmSims: createPaginatedFieldPolicy("filmSims"),
    },
  },
  Preset: { keyFields: ["id"] },
  FilmSim: { keyFields: ["id"] },
  User: { keyFields: ["id"] },
  Tag: { keyFields: ["id"] },
  PaginatedPresets: { keyFields: false },
  PaginatedFilmSims: { keyFields: false },
};

function createPaginatedFieldPolicy<TKey extends string>(itemsKey: TKey) {
  return {
    // A count query (limit 1) must not overwrite a browse query (limit 20).
    keyArgs: ["filter", "limit"],
    merge: createPageMerge(itemsKey),
  };
}

function createPageMerge<TKey extends string>(itemsKey: TKey) {
  return (
    existing: Readonly<PaginatedConnection<TKey>> | undefined,
    incoming: Readonly<PaginatedConnection<TKey>>,
    { args }: { args: Record<string, unknown> | null }
  ) => {
    const incomingItems = incoming[itemsKey];
    const mergedItems = existing ? [...existing[itemsKey]] : [];
    const paginationArguments = (args ?? {}) as PaginationArguments;
    const page = incoming.currentPage ?? paginationArguments.page ?? 1;
    const limit = paginationArguments.limit ?? DEFAULT_PAGE_SIZE;
    const offset = (page - 1) * limit;

    incomingItems.forEach((item, index) => {
      mergedItems[offset + index] = item;
    });

    return {
      ...existing,
      ...incoming,
      [itemsKey]: mergedItems,
    };
  };
}
