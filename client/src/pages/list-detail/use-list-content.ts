import { NetworkStatus, useQuery } from "@apollo/client";
import { useEffect, useMemo } from "react";
import {
  GET_ALL_FILMSIMS,
  type ListFilmSimsQueryData,
  type ListFilmSimsQueryVariables,
} from "@/features/film-sims/graphql/filmSims";
import {
  GET_ALL_PRESETS,
  type ListPresetsQueryData,
  type ListPresetsQueryVariables,
} from "@/features/presets/graphql/presets";
import { UserListDetail } from "./buildCombinedContent";

const ITEMS_PER_PAGE = 20;

export function useListContent(list?: UserListDetail | null) {
  const presetIds = useMemo(
    () => list?.presets.map(({ id }) => id) ?? [],
    [list?.presets]
  );
  const filmSimIds = useMemo(
    () => list?.filmSims.map(({ id }) => id) ?? [],
    [list?.filmSims]
  );
  const presetWhere = useMemo(() => ({ ids: presetIds }), [presetIds]);
  const filmSimWhere = useMemo(() => ({ ids: filmSimIds }), [filmSimIds]);

  const presetQuery = useQuery<ListPresetsQueryData, ListPresetsQueryVariables>(
    GET_ALL_PRESETS,
    {
      variables: { page: 1, limit: ITEMS_PER_PAGE, where: presetWhere },
      skip: !presetIds.length,
      notifyOnNetworkStatusChange: true,
    }
  );
  const filmSimQuery = useQuery<
    ListFilmSimsQueryData,
    ListFilmSimsQueryVariables
  >(GET_ALL_FILMSIMS, {
    variables: { page: 1, limit: ITEMS_PER_PAGE, where: filmSimWhere },
    skip: !filmSimIds.length,
    notifyOnNetworkStatusChange: true,
  });
  const presetPage = presetQuery.data?.listPresets;
  const filmSimPage = filmSimQuery.data?.listFilmSims;
  const fetchMorePresets = presetQuery.fetchMore;
  const fetchMoreFilmSims = filmSimQuery.fetchMore;
  const presetNetworkStatus = presetQuery.networkStatus;
  const filmSimNetworkStatus = filmSimQuery.networkStatus;

  useEffect(() => {
    if (
      !presetPage?.hasNextPage ||
      presetNetworkStatus !== NetworkStatus.ready
    ) {
      return;
    }
    void fetchMorePresets({
      variables: {
        page: presetPage.currentPage + 1,
        limit: ITEMS_PER_PAGE,
        where: presetWhere,
      },
    }).catch((error: unknown) =>
      console.error("Error loading list presets:", error)
    );
  }, [fetchMorePresets, presetWhere, presetPage, presetNetworkStatus]);

  useEffect(() => {
    if (
      !filmSimPage?.hasNextPage ||
      filmSimNetworkStatus !== NetworkStatus.ready
    ) {
      return;
    }
    void fetchMoreFilmSims({
      variables: {
        page: filmSimPage.currentPage + 1,
        limit: ITEMS_PER_PAGE,
        where: filmSimWhere,
      },
    }).catch((error: unknown) =>
      console.error("Error loading list film sims:", error)
    );
  }, [fetchMoreFilmSims, filmSimWhere, filmSimPage, filmSimNetworkStatus]);

  return {
    presets: presetQuery.data?.listPresets.presets ?? [],
    filmSims: filmSimQuery.data?.listFilmSims.filmSims ?? [],
    loading:
      (Boolean(presetIds.length) && presetQuery.loading && !presetQuery.data) ||
      (Boolean(filmSimIds.length) &&
        filmSimQuery.loading &&
        !filmSimQuery.data),
    error: presetQuery.error ?? filmSimQuery.error,
  };
}
