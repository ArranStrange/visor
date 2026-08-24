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
  query TestListFilmSims($page: Int, $limit: Int) {
    listFilmSims(page: $page, limit: $limit) {
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
});

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

function writeFilmSimPage(cache: InMemoryCache, page: number, ids: string[]) {
  cache.writeQuery({
    query: LIST_FILM_SIMS,
    variables: { page, limit: 2 },
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

function readFilmSimIds(cache: InMemoryCache): string[] {
  const data = cache.readQuery<{
    listFilmSims: { filmSims: Array<{ id: string }> };
  }>({ query: LIST_FILM_SIMS, variables: { page: 1, limit: 2 } });

  return data?.listFilmSims.filmSims.map(({ id }) => id) ?? [];
}
