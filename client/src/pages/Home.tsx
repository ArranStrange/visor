import React from "react";
import { Box, Container, Alert, CircularProgress } from "@mui/material";
import PresetCard from "../components/PresetCard";
import FilmSimCard from "../components/FilmSimCard";
import { useContentType } from "../context/ContentTypeFilter";
import ContentTypeToggle from "../components/ContentTypeToggle";
import StaggeredGrid from "../components/StaggeredGrid";
import { useQuery } from "@apollo/client";
import { GET_ALL_PRESETS } from "../graphql/queries/getAllPresets";
import { GET_ALL_FILMSIMS } from "../graphql/queries/getAllFilmSims";

const HomePage: React.FC = () => {
  const { contentType } = useContentType();

  const {
    data: presetData,
    loading: loadingPresets,
    error: presetError,
  } = useQuery(GET_ALL_PRESETS, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
  });

  const {
    data: filmSimData,
    loading: loadingFilmSims,
    error: filmSimError,
  } = useQuery(GET_ALL_FILMSIMS, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
  });

  const combined = React.useMemo(() => {
    const result: { type: "preset" | "film"; data: any }[] = [];

    if (
      (contentType === "all" || contentType === "presets") &&
      presetData?.listPresets
    ) {
      result.push(
        ...presetData.listPresets
          .filter((p) => p && p.creator) // Filter out presets without creators
          .map((p) => ({
            type: "preset" as const,
            data: {
              ...p,
              afterImage: p.afterImage || null,
              creator: p.creator || { username: "Unknown", avatar: "" },
            },
          }))
      );
    }

    if (
      (contentType === "all" || contentType === "films") &&
      filmSimData?.listFilmSims
    ) {
      result.push(
        ...filmSimData.listFilmSims
          .filter((f) => f && f.creator) // Filter out film sims without creators
          .map((f) => ({
            type: "film" as const,
            data: {
              ...f,
              title: f.name,
              thumbnail: f.sampleImages?.[0]?.url || "",
              creator: f.creator || { username: "Unknown", avatar: "" },
            },
          }))
      );
    }

    return result.sort(() => Math.random() - 0.5);
  }, [contentType, presetData, filmSimData]);

  if (loadingPresets || loadingFilmSims) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (presetError || filmSimError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 1, mb: 50 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {presetError?.message ||
            filmSimError?.message ||
            "Error loading content"}
        </Alert>
      </Container>
    );
  }

  if (!combined.length) {
    return (
      <Container maxWidth="lg" sx={{ mt: 1, mb: 50 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          No content found. Try changing the content type filter.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 1, mb: 50 }}>
      <ContentTypeToggle />
      <StaggeredGrid>
        {combined.map((item, index) => (
          <React.Fragment key={`${item.type}-${item.data.id}-${index}`}>
            {item.type === "preset" ? (
              <PresetCard {...item.data} />
            ) : (
              <FilmSimCard {...item.data} />
            )}
          </React.Fragment>
        ))}
      </StaggeredGrid>
    </Container>
  );
};

export default HomePage;
