import { describe, expect, it } from "vitest";
import { InMemoryCache, gql } from "@apollo/client";
import { paginationTypePolicies } from "../pagination-type-policies";

const LIST_FILM_SIMS = gql`
  query ListFilmSims(
    $filter: JSON
    $where: FilmSimFilterInput
    $limit: Int
    $page: Int
    $search: String
    $sort: ContentSort
  ) {
    listFilmSims(
      filter: $filter
      where: $where
      limit: $limit
      page: $page
      search: $search
      sort: $sort
    ) {
      totalCount
      hasNextPage
      currentPage
      totalPages
      filmSims {
        id
      }
    }
  }
`;

const GET_DISCUSSION = gql`
  query GetDiscussion($id: ID!) {
    getDiscussion(id: $id) {
      id
      title
      posts {
        id
        content
      }
    }
  }
`;

// Posts gained an `id` so a report can name one. Apollo normalises anything
// carrying `id` + `__typename` into its own top-level entity, which would have
// pulled embedded posts out of their parent discussion and let the same post id
// seen through two query shapes overwrite itself. `keyFields: false` keeps them
// inline, exactly as before the id existed.
//
// This is pinned because losing that one line breaks nothing loudly: no test
// fails, no type errors, discussions just start merging differently.
describe("DiscussionPost normalisation", () => {
  const discussion = (id: string, posts: Array<{ id: string; content: string }>) => ({
    __typename: "Discussion",
    id,
    title: `Discussion ${id}`,
    posts: posts.map((post) => ({ __typename: "DiscussionPost", ...post })),
  });

  it("keeps posts embedded rather than normalising them into entities", () => {
    const cache = new InMemoryCache({ typePolicies: paginationTypePolicies });

    cache.writeQuery({
      query: GET_DISCUSSION,
      variables: { id: "d1" },
      data: {
        getDiscussion: discussion("d1", [
          { id: "p1", content: "first" },
          { id: "p2", content: "second" },
        ]),
      },
    });

    const entityKeys = Object.keys(cache.extract());

    expect(entityKeys.filter((key) => key.startsWith("DiscussionPost"))).toEqual([]);
    expect(entityKeys).toContain("Discussion:d1");
  });

  it("reads posts back losslessly", () => {
    const cache = new InMemoryCache({ typePolicies: paginationTypePolicies });
    const posts = [
      { id: "p1", content: "first" },
      { id: "p2", content: "second" },
    ];

    cache.writeQuery({
      query: GET_DISCUSSION,
      variables: { id: "d1" },
      data: { getDiscussion: discussion("d1", posts) },
    });

    const result = cache.readQuery<{
      getDiscussion: { posts: Array<{ id: string; content: string }> };
    }>({ query: GET_DISCUSSION, variables: { id: "d1" } });

    expect(result?.getDiscussion.posts).toHaveLength(2);
    expect(result?.getDiscussion.posts.map((post) => post.content)).toEqual([
      "first",
      "second",
    ]);
  });

  it("does not let the same post id leak between two discussions", () => {
    // The failure this guards: if posts were normalised, writing d2's copy of
    // post p1 would overwrite d1's, and d1 would silently start showing d2's
    // content for that post.
    const cache = new InMemoryCache({ typePolicies: paginationTypePolicies });

    cache.writeQuery({
      query: GET_DISCUSSION,
      variables: { id: "d1" },
      data: {
        getDiscussion: discussion("d1", [{ id: "p1", content: "original" }]),
      },
    });
    cache.writeQuery({
      query: GET_DISCUSSION,
      variables: { id: "d2" },
      data: {
        getDiscussion: discussion("d2", [{ id: "p1", content: "different" }]),
      },
    });

    const first = cache.readQuery<{
      getDiscussion: { posts: Array<{ content: string }> };
    }>({ query: GET_DISCUSSION, variables: { id: "d1" } });

    expect(first?.getDiscussion.posts[0].content).toBe("original");
  });
});

interface PresetItem {
  __typename: "Preset";
  id: string;
}

interface PresetConnection {
  __typename: "PaginatedPresets";
  totalCount: number;
  hasNextPage: boolean;
  currentPage: number;
  totalPages: number;
  presets: readonly PresetItem[];
}

type MergePresets = (
  existing: Readonly<PresetConnection> | undefined,
  incoming: Readonly<PresetConnection>,
  options: { args: Record<string, unknown> | null }
) => PresetConnection;

type ReadPresets = (
  existing: Readonly<PresetConnection> | undefined
) => PresetConnection | undefined;

const presetPolicy = getPresetPolicy();

describe("preset pagination field policy", () => {
  it("appends pages at offsets derived from page and limit", () => {
    const firstPage = presetPolicy.merge(undefined, connection(1, ["1", "2"]), {
      args: { page: 1, limit: 2 },
    });
    const secondPage = presetPolicy.merge(
      firstPage,
      connection(2, ["3", "4"]),
      { args: { page: 2, limit: 2 } }
    );

    expect(itemIds(presetPolicy.read(secondPage))).toEqual([
      "1",
      "2",
      "3",
      "4",
    ]);
  });

  it("overwrites the existing slots when a page is refetched", () => {
    const firstPage = presetPolicy.merge(undefined, connection(1, ["1", "2"]), {
      args: { page: 1, limit: 2 },
    });
    const secondPage = presetPolicy.merge(
      firstPage,
      connection(2, ["3", "4"]),
      { args: { page: 2, limit: 2 } }
    );
    const refetched = presetPolicy.merge(
      secondPage,
      connection(1, ["1-new", "2-new"]),
      { args: { page: 1, limit: 2 } }
    );

    expect(itemIds(presetPolicy.read(refetched))).toEqual([
      "1-new",
      "2-new",
      "3",
      "4",
    ]);
  });

  it("compacts holes when pages arrive out of order", () => {
    const thirdPage = presetPolicy.merge(undefined, connection(3, ["5", "6"]), {
      args: { page: 3, limit: 2 },
    });

    expect(itemIds(presetPolicy.read(thirdPage))).toEqual(["5", "6"]);

    const secondPage = presetPolicy.merge(
      thirdPage,
      connection(2, ["3", "4"]),
      { args: { page: 2, limit: 2 } }
    );

    expect(itemIds(presetPolicy.read(secondPage))).toEqual([
      "3",
      "4",
      "5",
      "6",
    ]);
  });

  it("isolates filter and limit cache entries while sharing pages", () => {
    expect(presetPolicy.keyArgs).toEqual([
      "filter",
      "where",
      "limit",
      "search",
      "sort",
    ]);
    expect(presetPolicy.keyArgs).not.toContain("page");
  });

  it("keys on every argument that changes which documents come back", () => {
    // `where` was added in Phase 1 for the sensor filter and `search`/`sort`
    // in Phase 3. Each one changes the result set, so each has to participate
    // in cache identity — otherwise two different queries resolve to the same
    // entry and the filter, search or ordering silently does nothing.
    for (const policy of [getPresetPolicy(), getFilmSimPolicy()]) {
      for (const argument of ["filter", "where", "limit", "search", "sort"]) {
        expect(policy.keyArgs).toContain(argument);
      }
    }
  });
});

describe("where isolates cache entries", () => {
  it("gives two sensors their own entries under an identical filter and limit", () => {
    const cache = new InMemoryCache({ typePolicies: paginationTypePolicies });

    writeFilmSims(cache, { sensorKey: "x-trans-iv" }, ["iv-1", "iv-2"]);
    writeFilmSims(cache, { sensorKey: "x-trans-v" }, ["v-1"]);

    // The whole point: an X-Trans IV body must not be shown the entry the
    // X-Trans V query filled in, and vice versa.
    expect(readFilmSimIds(cache, { sensorKey: "x-trans-iv" })).toEqual([
      "iv-1",
      "iv-2",
    ]);
    expect(readFilmSimIds(cache, { sensorKey: "x-trans-v" })).toEqual(["v-1"]);
    expect(listFilmSimsFieldKeys(cache)).toHaveLength(2);
  });

  it("keeps an absent where separate from a sensor-filtered one", () => {
    const cache = new InMemoryCache({ typePolicies: paginationTypePolicies });

    writeFilmSims(cache, undefined, ["all-1", "all-2"]);
    writeFilmSims(cache, { sensorKey: "x-trans-v" }, ["v-1"]);

    expect(readFilmSimIds(cache, undefined)).toEqual(["all-1", "all-2"]);
    expect(readFilmSimIds(cache, { sensorKey: "x-trans-v" })).toEqual(["v-1"]);
  });

  it("shares one entry when the where values match", () => {
    const cache = new InMemoryCache({ typePolicies: paginationTypePolicies });

    writeFilmSims(cache, { sensorKey: "x-trans-iv" }, ["iv-1"]);
    writeFilmSims(cache, { sensorKey: "x-trans-iv" }, ["iv-1-refetched"]);

    expect(readFilmSimIds(cache, { sensorKey: "x-trans-iv" })).toEqual([
      "iv-1-refetched",
    ]);
    expect(listFilmSimsFieldKeys(cache)).toHaveLength(1);
  });
});

describe("search isolates cache entries", () => {
  it("gives two search terms their own entries", () => {
    // Search is server-side now. If `search` were missing from keyArgs, typing
    // a second term would read back the first term's results — the grid would
    // look like it was ignoring what you typed.
    const cache = new InMemoryCache({ typePolicies: paginationTypePolicies });

    writeFilmSims(cache, undefined, ["portra-1"], { search: "portra" });
    writeFilmSims(cache, undefined, ["acros-1"], { search: "acros" });

    expect(readFilmSimIds(cache, undefined, { search: "portra" })).toEqual([
      "portra-1",
    ]);
    expect(readFilmSimIds(cache, undefined, { search: "acros" })).toEqual([
      "acros-1",
    ]);
    expect(listFilmSimsFieldKeys(cache)).toHaveLength(2);
  });

  it("keeps an unsearched grid separate from a searched one", () => {
    const cache = new InMemoryCache({ typePolicies: paginationTypePolicies });

    writeFilmSims(cache, undefined, ["all-1", "all-2"]);
    writeFilmSims(cache, undefined, ["portra-1"], { search: "portra" });

    expect(readFilmSimIds(cache, undefined)).toEqual(["all-1", "all-2"]);
    expect(readFilmSimIds(cache, undefined, { search: "portra" })).toEqual([
      "portra-1",
    ]);
  });

  it("shares one entry when the search term is the same", () => {
    const cache = new InMemoryCache({ typePolicies: paginationTypePolicies });

    writeFilmSims(cache, undefined, ["portra-1"], { search: "portra" });
    writeFilmSims(cache, undefined, ["portra-1-refetched"], {
      search: "portra",
    });

    expect(readFilmSimIds(cache, undefined, { search: "portra" })).toEqual([
      "portra-1-refetched",
    ]);
    expect(listFilmSimsFieldKeys(cache)).toHaveLength(1);
  });
});

describe("sort isolates cache entries", () => {
  it("gives two orderings their own entries", () => {
    // The merge writes incoming items into page-derived slots. Two orderings
    // sharing an entry would interleave: page 1 of POPULAR would overwrite
    // slots 0-19 of the NEWEST list and the grid would show a mixture of both.
    const cache = new InMemoryCache({ typePolicies: paginationTypePolicies });

    writeFilmSims(cache, undefined, ["new-1", "new-2"], { sort: "NEWEST" });
    writeFilmSims(cache, undefined, ["pop-1", "pop-2"], { sort: "POPULAR" });

    expect(readFilmSimIds(cache, undefined, { sort: "NEWEST" })).toEqual([
      "new-1",
      "new-2",
    ]);
    expect(readFilmSimIds(cache, undefined, { sort: "POPULAR" })).toEqual([
      "pop-1",
      "pop-2",
    ]);
    expect(listFilmSimsFieldKeys(cache)).toHaveLength(2);
  });

  it("keeps an explicit default sort separate from an absent one", () => {
    // Not cosmetic: the client sends no `sort` until the user picks one, so
    // these two really are distinct requests as far as the cache is concerned.
    const cache = new InMemoryCache({ typePolicies: paginationTypePolicies });

    writeFilmSims(cache, undefined, ["implicit-1"]);
    writeFilmSims(cache, undefined, ["explicit-1"], { sort: "NEWEST" });

    expect(readFilmSimIds(cache, undefined)).toEqual(["implicit-1"]);
    expect(readFilmSimIds(cache, undefined, { sort: "NEWEST" })).toEqual([
      "explicit-1",
    ]);
  });

  it("separates a searched-and-sorted grid from a merely searched one", () => {
    const cache = new InMemoryCache({ typePolicies: paginationTypePolicies });

    writeFilmSims(cache, undefined, ["s-1"], { search: "portra" });
    writeFilmSims(cache, undefined, ["s-2"], {
      search: "portra",
      sort: "POPULAR",
    });

    expect(readFilmSimIds(cache, undefined, { search: "portra" })).toEqual([
      "s-1",
    ]);
    expect(
      readFilmSimIds(cache, undefined, { search: "portra", sort: "POPULAR" })
    ).toEqual(["s-2"]);
  });
});

interface DiscoveryArgs {
  search?: string;
  sort?: string;
}

function discoveryVariables(
  where: { sensorKey: string } | undefined,
  { search, sort }: DiscoveryArgs = {}
) {
  // Identical filter, limit and page throughout, so any shared cache entry is
  // keyArgs failing to see the argument under test.
  return {
    filter: null,
    where: where ?? null,
    limit: 20,
    page: 1,
    search: search ?? null,
    sort: sort ?? null,
  };
}

function writeFilmSims(
  cache: InMemoryCache,
  where: { sensorKey: string } | undefined,
  ids: string[],
  discovery?: DiscoveryArgs
) {
  cache.writeQuery({
    query: LIST_FILM_SIMS,
    variables: discoveryVariables(where, discovery),
    data: {
      listFilmSims: {
        __typename: "PaginatedFilmSims",
        totalCount: ids.length,
        hasNextPage: false,
        currentPage: 1,
        totalPages: 1,
        filmSims: ids.map((id) => ({ __typename: "FilmSim", id })),
      },
    },
  });
}

function readFilmSimIds(
  cache: InMemoryCache,
  where: { sensorKey: string } | undefined,
  discovery?: DiscoveryArgs
): string[] | undefined {
  const result = cache.readQuery<{
    listFilmSims: { filmSims: { id: string }[] };
  }>({
    query: LIST_FILM_SIMS,
    variables: discoveryVariables(where, discovery),
  });

  return result?.listFilmSims.filmSims.map((filmSim) => filmSim.id);
}

function listFilmSimsFieldKeys(cache: InMemoryCache): string[] {
  const rootQuery = cache.extract().ROOT_QUERY ?? {};
  return Object.keys(rootQuery).filter((key) => key.startsWith("listFilmSims"));
}

function getFilmSimPolicy() {
  const policy = paginationTypePolicies.Query?.fields?.listFilmSims;

  if (!policy || typeof policy === "function") {
    throw new Error("Expected listFilmSims to define a field policy");
  }

  return { keyArgs: policy.keyArgs };
}

function getPresetPolicy() {
  const policy = paginationTypePolicies.Query?.fields?.listPresets;

  if (
    !policy ||
    typeof policy === "function" ||
    typeof policy.merge !== "function" ||
    typeof policy.read !== "function"
  ) {
    throw new Error("Expected listPresets to define merge and read functions");
  }

  return {
    keyArgs: policy.keyArgs,
    merge: policy.merge as unknown as MergePresets,
    read: policy.read as unknown as ReadPresets,
  };
}

function connection(page: number, ids: string[]): PresetConnection {
  return {
    __typename: "PaginatedPresets",
    totalCount: 6,
    hasNextPage: page < 3,
    currentPage: page,
    totalPages: 3,
    presets: ids.map((id) => ({ __typename: "Preset", id })),
  };
}

function itemIds(connection: PresetConnection | undefined): string[] {
  return connection?.presets.map((preset) => preset.id) ?? [];
}
