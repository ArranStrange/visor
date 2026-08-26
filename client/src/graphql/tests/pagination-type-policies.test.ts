import { describe, expect, it } from "vitest";
import { InMemoryCache, gql } from "@apollo/client";
import { paginationTypePolicies } from "../pagination-type-policies";

const LIST_FILM_SIMS = gql`
  query ListFilmSims(
    $filter: JSON
    $where: FilmSimFilterInput
    $limit: Int
    $page: Int
  ) {
    listFilmSims(filter: $filter, where: $where, limit: $limit, page: $page) {
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
    expect(presetPolicy.keyArgs).toEqual(["filter", "where", "limit"]);
    expect(presetPolicy.keyArgs).not.toContain("page");
  });

  it("keys on the typed where argument as well as the legacy JSON filter", () => {
    // Two queries that differ only in `where` select different documents; if
    // `where` were missing from keyArgs they would share one cache entry and
    // a sensor-filtered grid would show unfiltered results.
    for (const policy of [getPresetPolicy(), getFilmSimPolicy()]) {
      expect(policy.keyArgs).toContain("where");
      expect(policy.keyArgs).toContain("filter");
      expect(policy.keyArgs).toContain("limit");
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

function writeFilmSims(
  cache: InMemoryCache,
  where: { sensorKey: string } | undefined,
  ids: string[]
) {
  cache.writeQuery({
    query: LIST_FILM_SIMS,
    // Identical filter and limit throughout: `where` is the only difference,
    // so any shared entry would be keyArgs failing to see it.
    variables: { filter: null, where: where ?? null, limit: 20, page: 1 },
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
  where: { sensorKey: string } | undefined
): string[] | undefined {
  const result = cache.readQuery<{
    listFilmSims: { filmSims: { id: string }[] };
  }>({
    query: LIST_FILM_SIMS,
    variables: { filter: null, where: where ?? null, limit: 20, page: 1 },
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
