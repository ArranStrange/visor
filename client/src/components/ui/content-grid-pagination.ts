import type { QueryResult } from "@apollo/client";
import type {
  ListFilmSimsQueryData,
  ListFilmSimsQueryVariables,
} from "@/features/film-sims/graphql/filmSims";
import type {
  ListPresetsQueryData,
  ListPresetsQueryVariables,
} from "@/features/presets/graphql/presets";
import type {
  ContentSort,
  FilmSimFilterInput,
  PresetFilterInput,
} from "@/types/graphql";

interface PageState {
  currentPage: number;
  hasNextPage: boolean;
}

interface FetchNextContentPagesOptions {
  presetWhere?: PresetFilterInput;
  filmSimWhere?: FilmSimFilterInput;
  /**
   * Search and sort have to be repeated on every fetchMore: they are part of
   * the Apollo cache key, so omitting them would append page 2 of the
   * unsearched, default-ordered list onto the searched one.
   */
  search?: string;
  sort?: ContentSort;
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
  presetWhere,
  filmSimWhere,
  search,
  sort,
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
          where: presetWhere,
          search,
          sort,
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
          where: filmSimWhere,
          search,
          sort,
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
