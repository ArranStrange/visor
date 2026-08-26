import { gql, InMemoryCache } from "@apollo/client";
import { paginationTypePolicies } from "../../src/graphql/pagination-type-policies";

const LIST_PRESETS = gql`
  query TestListPresets($page: Int, $limit: Int, $filter: JSON) {
    listPresets(page: $page, limit: $limit, filter: $filter) {
      presets {
        id
        title
      }
      totalCount
      hasNextPage
      currentPage
      totalPages
    }
  }
`;

const LIST_FILM_SIMS = gql`
  query TestListFilmSims(
    $page: Int
    $limit: Int
    $search: String
    $sort: ContentSort
  ) {
    listFilmSims(page: $page, limit: $limit, search: $search, sort: $sort) {
      filmSims {
        id
        name
      }
      totalCount
      hasNextPage
      currentPage
      totalPages
    }
  }
`;

describe("Apollo paginated list cache", () => {
  it("configures merge policies for both paginated list fields", () => {
    cy.readFile("src/graphql/apolloClient.ts").then((source: string) => {
      expect(source).to.include("typePolicies:");
    });
    cy.readFile("src/graphql/pagination-type-policies.ts").then(
      (source: string) => {
        expect(source).to.include("listPresets:");
        expect(source).to.include("listFilmSims:");
      }
    );
  });

  it("merges preset pages by offset without mixing filters", () => {
    const cache = createCache();

    writePresetPage(cache, "featured", 1, ["preset-1", "preset-2"]);
    writePresetPage(cache, "featured", 2, ["preset-3", "preset-4"]);
    writePresetPage(cache, "other", 1, ["preset-5"]);
    writePresetPage(cache, "featured", 1, ["count-query-preset"], 1);

    expect(readPresetIds(cache, "featured")).to.deep.equal([
      "preset-1",
      "preset-2",
      "preset-3",
      "preset-4",
    ]);
    expect(readPresetIds(cache, "other")).to.deep.equal(["preset-5"]);
  });

  it("overwrites refetched film-sim page slots without duplicates", () => {
    const cache = createCache();

    writeFilmSimPage(cache, 1, ["film-1", "film-2"]);
    writeFilmSimPage(cache, 2, ["film-3", "film-4"]);
    writeFilmSimPage(cache, 1, ["film-1-updated", "film-2-updated"]);

    expect(readFilmSimIds(cache)).to.deep.equal([
      "film-1-updated",
      "film-2-updated",
      "film-3",
      "film-4",
    ]);
  });

  it("does not let a search term read back another term's results", () => {
    const cache = createCache();

    writeFilmSimPage(cache, 1, ["portra-1"], { search: "portra" });
    writeFilmSimPage(cache, 1, ["acros-1"], { search: "acros" });

    expect(readFilmSimIds(cache, { search: "portra" })).to.deep.equal([
      "portra-1",
    ]);
    expect(readFilmSimIds(cache, { search: "acros" })).to.deep.equal([
      "acros-1",
    ]);
  });

  it("does not interleave two sort orders into one list", () => {
    // The merge writes into page-derived slots, so a shared entry would let
    // page 1 of POPULAR overwrite slots 0-1 of the NEWEST list.
    const cache = createCache();

    writeFilmSimPage(cache, 1, ["new-1", "new-2"], { sort: "NEWEST" });
    writeFilmSimPage(cache, 1, ["pop-1", "pop-2"], { sort: "POPULAR" });

    expect(readFilmSimIds(cache, { sort: "NEWEST" })).to.deep.equal([
      "new-1",
      "new-2",
    ]);
    expect(readFilmSimIds(cache, { sort: "POPULAR" })).to.deep.equal([
      "pop-1",
      "pop-2",
    ]);
  });
});

interface DiscoveryArgs {
  search?: string;
  sort?: string;
}

function createCache() {
  return new InMemoryCache({ typePolicies: paginationTypePolicies });
}

function writePresetPage(
  cache: InMemoryCache,
  filterName: string,
  page: number,
  ids: string[],
  limit = 2
) {
  cache.writeQuery({
    query: LIST_PRESETS,
    variables: { page, limit, filter: { category: filterName } },
    data: {
      listPresets: {
        __typename: "PaginatedPresets",
        presets: ids.map((id) => ({ __typename: "Preset", id, title: id })),
        totalCount: 4,
        hasNextPage: page === 1,
        currentPage: page,
        totalPages: 2,
      },
    },
  });
}

function readPresetIds(cache: InMemoryCache, filterName: string): string[] {
  const data = cache.readQuery<{
    listPresets: { presets: Array<{ id: string }> };
  }>({
    query: LIST_PRESETS,
    variables: { page: 1, limit: 2, filter: { category: filterName } },
  });

  return data?.listPresets.presets.map(({ id }) => id) ?? [];
}

function filmSimVariables(page: number, { search, sort }: DiscoveryArgs = {}) {
  return { page, limit: 2, search: search ?? null, sort: sort ?? null };
}

function writeFilmSimPage(
  cache: InMemoryCache,
  page: number,
  ids: string[],
  discovery?: DiscoveryArgs
) {
  cache.writeQuery({
    query: LIST_FILM_SIMS,
    variables: filmSimVariables(page, discovery),
    data: {
      listFilmSims: {
        __typename: "PaginatedFilmSims",
        filmSims: ids.map((id) => ({ __typename: "FilmSim", id, name: id })),
        totalCount: 4,
        hasNextPage: page === 1,
        currentPage: page,
        totalPages: 2,
      },
    },
  });
}

function readFilmSimIds(
  cache: InMemoryCache,
  discovery?: DiscoveryArgs
): string[] {
  const data = cache.readQuery<{
    listFilmSims: { filmSims: Array<{ id: string }> };
  }>({ query: LIST_FILM_SIMS, variables: filmSimVariables(1, discovery) });

  return data?.listFilmSims.filmSims.map(({ id }) => id) ?? [];
}
