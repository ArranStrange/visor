import React, { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { CircularProgress, Alert, Box } from "@mui/material";
import { useContentType } from "../context/ContentTypeFilter";

import { GET_ALL_PRESETS } from "../graphql/queries/getAllPresets";
import { GET_ALL_FILMSIMS } from "../graphql/queries/getAllFilmSims";

import PresetCard from "./PresetCard";
import FilmSimCard from "./FilmSimCard";
import StaggeredGrid from "./StaggeredGrid";

interface ContentGridLoaderProps {
  contentType?: "all" | "presets" | "films";
  filter?: Record<string, any>;
  searchQuery?: string;
  customData?: Array<any>;
  renderItem?: (item: any) => React.ReactNode;
}

const ContentGridLoader: React.FC<ContentGridLoaderProps> = ({
  contentType = "all",
  filter,
  searchQuery,
  customData,
  renderItem,
}) => {
  const {
    data: presetData,
    loading: loadingPresets,
    error: presetError,
  } = useQuery(GET_ALL_PRESETS, {
    variables: { filter },
    skip: !!customData,
    fetchPolicy: "cache-and-network",
  });

  const {
    data: filmSimData,
    loading: loadingFilmSims,
    error: filmSimError,
  } = useQuery(GET_ALL_FILMSIMS, {
    variables: { filter },
    skip: !!customData,
    fetchPolicy: "cache-and-network",
  });

  const isLoading = loadingPresets || loadingFilmSims;
  const isError = presetError || filmSimError;

  const combined = useMemo(() => {
    if (customData) {
      return customData;
    }

    const results: { type: "preset" | "film"; data: any }[] = [];

    if (
      (contentType === "all" || contentType === "presets") &&
      presetData?.listPresets
    ) {
      results.push(
        ...presetData.listPresets
          .filter((p) => p && p.creator)
          .map((p) => ({
            type: "preset" as const,
            data: p,
          }))
      );
    }

    if (
      (contentType === "all" || contentType === "films") &&
      filmSimData?.listFilmSims
    ) {
      results.push(
        ...filmSimData.listFilmSims
          .filter((f) => f && f.creator)
          .map((f) => ({
            type: "film" as const,
            data: {
              ...f,
              title: f.name,
              thumbnail: f.sampleImages?.[0]?.url || "",
            },
          }))
      );
    }

    return searchQuery
      ? results.filter((item) =>
          item.data.title?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : results;
  }, [customData, contentType, presetData, filmSimData, searchQuery]);

  const { randomizeOrder } = useContentType();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {presetError?.message ||
          filmSimError?.message ||
          "Failed to load content"}
      </Alert>
    );
  }

  if (!combined.length) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        No content found. Try adjusting filters or search terms.
      </Alert>
    );
  }

  const children = combined.map((item, index) =>
    renderItem ? (
      <React.Fragment key={`${item.type}-${item.data.id}-${index}`}>
        {renderItem(item.data)}
      </React.Fragment>
    ) : item.type === "preset" ? (
      <PresetCard key={`preset-${item.data.id}-${index}`} {...item.data} />
    ) : (
      <FilmSimCard key={`film-${item.data.id}-${index}`} {...item.data} />
    )
  );

  return (
    <Box>
      <StaggeredGrid randomizeOrder={randomizeOrder}>{children}</StaggeredGrid>
    </Box>
  );
};

export default ContentGridLoader;
