import type { QueryResult } from "@apollo/client";
import type {
  ListFilmSimsQueryData,
  ListFilmSimsQueryVariables,
} from "../../graphql/filmSims";
import type {
  ListPresetsQueryData,
  ListPresetsQueryVariables,
} from "../../graphql/presets";
import type { GridFilter } from "./content-grid-data";

interface PageState {
  currentPage: number;
  hasNextPage: boolean;
}

interface FetchNextContentPagesOptions {
  filter?: GridFilter;
  isLoading: boolean;
  presets?: PageState;
  filmSims?: PageState;
  fetchMorePresets: QueryResult<
    ListPresetsQueryData,
    ListPresetsQueryVariables
  >["fetchMore"];
  fetchMoreFilmSims: QueryResult<
    ListFilmSimsQueryData,
    ListFilmSimsQueryVariables
  >["fetchMore"];
}

const ITEMS_PER_PAGE = 20;

export async function fetchNextContentPages({
  filter,
  isLoading,
  presets,
  filmSims,
  fetchMorePresets,
  fetchMoreFilmSims,
}: FetchNextContentPagesOptions) {
  if (isLoading) return;
  const requests: Array<Promise<unknown>> = [];

  if (presets?.hasNextPage) {
    requests.push(
      fetchMorePresets({
        variables: {
          page: presets.currentPage + 1,
          limit: ITEMS_PER_PAGE,
          filter,
        },
      })
    );
  }
  if (filmSims?.hasNextPage) {
    requests.push(
      fetchMoreFilmSims({
        variables: {
          page: filmSims.currentPage + 1,
          limit: ITEMS_PER_PAGE,
          filter,
        },
      })
    );
  }

  try {
    await Promise.all(requests);
  } catch (error) {
    console.error("Error loading more content:", error);
  }
}
