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
  // Posts carry an id now (a report needs to name one), but they are still
  // subdocuments of a discussion: normalising them would change how every
  // discussion read merges, for no benefit.
  DiscussionPost: { keyFields: false },
  PaginatedPresets: { keyFields: false },
  PaginatedFilmSims: { keyFields: false },
};

function createPaginatedFieldPolicy<TKey extends string>(itemsKey: TKey) {
  return {
    // A count query (limit 1) must not overwrite a browse query (limit 20).
    // `where` is the typed filter and `filter` its deprecated JSON
    // predecessor; both change which documents come back, so both have to be
    // part of the cache key.
    keyArgs: ["filter", "where", "limit"],
    merge: createPageMerge(itemsKey),
    read: createPageRead(itemsKey),
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

function createPageRead<TKey extends string>(itemsKey: TKey) {
  return (existing: Readonly<PaginatedConnection<TKey>> | undefined) => {
    if (!existing) return existing;

    // Out-of-order arrival (page 3 before page 2) leaves holes in the
    // slot array; compact at read so the UI never sees undefined items,
    // while the sparse slots stay intact in the cache for later merges.
    const items = existing[itemsKey];
    if (!items?.includes(undefined as unknown as CacheItem)) return existing;

    return {
      ...existing,
      [itemsKey]: items.filter((item) => item !== undefined),
    };
  };
}
