import React, { useCallback } from "react";
import { NetworkStatus, useQuery } from "@apollo/client";
import { Alert, Box } from "@mui/material";
import { useContentType } from "../../context/ContentTypeFilter";
import {
  GET_ALL_PRESETS,
  type ListPresetsQueryData,
  type ListPresetsQueryVariables,
} from "../../graphql/presets";
import {
  GET_ALL_FILMSIMS,
  type ListFilmSimsQueryData,
  type ListFilmSimsQueryVariables,
} from "../../graphql/filmSims";
import StaggeredGrid from "./StaggeredGrid";
import { ContentGridItem } from "./content-grid-item";
import { fetchNextContentPages } from "./content-grid-pagination";
import {
  buildGridContent,
  GridContentData,
  GridContentType,
  GridFilter,
} from "./content-grid-data";

interface ContentGridLoaderProps {
  contentType?: GridContentType;
  filter?: GridFilter;
  searchQuery?: string;
  customData?: readonly unknown[];
  renderItem?: (item: GridContentData) => React.ReactNode;
}

const ITEMS_PER_PAGE = 20;

const ContentGridLoader: React.FC<ContentGridLoaderProps> = ({
  contentType = "all",
  filter,
  searchQuery,
  customData,
  renderItem,
}) => {
  const { randomizeOrder } = useContentType();
  const hasCustomData = customData !== undefined;
  const loadPresets = !hasCustomData && contentType !== "films";
  const loadFilmSims = !hasCustomData && contentType !== "presets";
  const variables = { page: 1, limit: ITEMS_PER_PAGE, filter };

  const presetQuery = useQuery<ListPresetsQueryData, ListPresetsQueryVariables>(
    GET_ALL_PRESETS,
    {
      variables,
      skip: !loadPresets,
      notifyOnNetworkStatusChange: true,
    }
  );
  const filmSimQuery = useQuery<
    ListFilmSimsQueryData,
    ListFilmSimsQueryVariables
  >(GET_ALL_FILMSIMS, {
    variables,
    skip: !loadFilmSims,
    notifyOnNetworkStatusChange: true,
  });

  const content = buildGridContent({
    contentType,
    customData,
    presetData: presetQuery.data,
    filmSimData: filmSimQuery.data,
    searchQuery,
  });
  const isLoadingMore =
    presetQuery.networkStatus === NetworkStatus.fetchMore ||
    filmSimQuery.networkStatus === NetworkStatus.fetchMore;
  const loadMore = useCallback(
    () =>
      fetchNextContentPages({
        filter,
        isLoading: isLoadingMore,
        presets: presetQuery.data?.listPresets,
        filmSims: filmSimQuery.data?.listFilmSims,
        fetchMorePresets: presetQuery.fetchMore,
        fetchMoreFilmSims: filmSimQuery.fetchMore,
      }),
    [
      filter,
      presetQuery.data?.listPresets,
      presetQuery.fetchMore,
      filmSimQuery.data?.listFilmSims,
      filmSimQuery.fetchMore,
      isLoadingMore,
    ]
  );
  const initialLoading =
    (loadPresets && presetQuery.loading && !presetQuery.data) ||
    (loadFilmSims && filmSimQuery.loading && !filmSimQuery.data);
  const hasMore =
    !hasCustomData &&
    Boolean(
      presetQuery.data?.listPresets.hasNextPage ||
      filmSimQuery.data?.listFilmSims.hasNextPage
    );
  const error = presetQuery.error ?? filmSimQuery.error;

  if (error && !content.length) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error.message}
      </Alert>
    );
  }

  if (!content.length && !initialLoading) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        No content found. Try adjusting filters or search terms.
      </Alert>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: "100vw", overflow: "hidden" }}>
      <StaggeredGrid
        key={`grid-${contentType}`}
        loading={initialLoading}
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoading={isLoadingMore}
        randomizeOrder={randomizeOrder}
      >
        {content.map(renderContentItem)}
      </StaggeredGrid>
    </Box>
  );

  function renderContentItem(item: (typeof content)[number]) {
    const key = `${item.type}-${item.data.id ?? item.data.slug ?? item.data.title}`;
    return <ContentGridItem key={key} item={item} renderItem={renderItem} />;
  }
};

export default ContentGridLoader;
