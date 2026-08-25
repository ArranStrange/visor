import React, { useState, useEffect, useMemo } from "react";
import { Box, Chip, Container, InputBase, Divider } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { getSensorByLabel } from "@/features/film-sims/utils/fujifilmSensors";
import {
  GET_ALL_FILMSIMS,
  type ListFilmSimsQueryData,
  type ListFilmSimsQueryVariables,
} from "@/features/film-sims/graphql/filmSims";
import SensorProfileCard from "@/features/film-sims/components/SensorProfileCard";

import ContentTypeToggle from "../components/ui/ContentTypeToggle";
import ContentGridLoader from "../components/ui/ContentGridLoader";
import TagsList from "../components/ui/TagsList";
import { useContentType } from "../context/ContentTypeFilter";
import { useTags } from "../context/TagContext";

const SearchView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const { contentType } = useContentType();
  const { tags, loading: tagsLoading, searchTags } = useTags();

  // Sensor filter (film sims only) — set by clicking a sensor chip on a
  // film sim detail page, e.g. /search?sensor=X-Trans III
  const sensorParam = searchParams.get("sensor");
  const activeSensorInfo = sensorParam ? getSensorByLabel(sensorParam) : null;
  const activeSensor = sensorParam
    ? (activeSensorInfo?.label ?? sensorParam)
    : null;
  // The URL carries the display label; the server filters on the slug. An
  // unrecognised label is forwarded as-is so the server rejects it visibly
  // rather than quietly returning every film sim.
  const activeSensorKey = sensorParam
    ? (activeSensorInfo?.key ?? sensorParam)
    : null;

  const clearSensor = () => {
    searchParams.delete("sensor");
    setSearchParams(searchParams);
  };

  // Memoised so the query variables keep their identity across renders and
  // Apollo doesn't treat every render as a new cache entry.
  const presetWhere = useMemo(
    () => (activeTagId ? { tagId: activeTagId } : undefined),
    [activeTagId]
  );
  const filmSimWhere = useMemo(
    () =>
      activeTagId || activeSensorKey
        ? {
            ...(activeTagId ? { tagId: activeTagId } : {}),
            ...(activeSensorKey ? { sensorKey: activeSensorKey } : {}),
          }
        : undefined,
    [activeTagId, activeSensorKey]
  );
  const sensorCountWhere = useMemo(
    () => (activeSensorKey ? { sensorKey: activeSensorKey } : undefined),
    [activeSensorKey]
  );

  // Lightweight count for the sensor profile card header.
  const { data: sensorCountData } = useQuery<
    ListFilmSimsQueryData,
    ListFilmSimsQueryVariables
  >(GET_ALL_FILMSIMS, {
    variables: { page: 1, limit: 1, where: sensorCountWhere },
    skip: !activeSensorKey,
  });
  const sensorFilmSimCount: number | null =
    sensorCountData?.listFilmSims?.totalCount ?? null;

  // Fetch all tags on mount
  useEffect(() => {
    searchTags();
  }, [searchTags]);

  useEffect(() => {
    const qParam = searchParams.get("q");
    if (qParam) {
      setKeyword(qParam);
    }

    const tagParam = searchParams.get("tag");
    if (tagParam) {
      const tag = tags.find(
        (t) => t.displayName.toLowerCase() === tagParam.toLowerCase()
      );
      if (tag) {
        setActiveTagId(tag.id);
      }
    }
  }, [searchParams, tags]);

  const handleClear = () => {
    setKeyword("");
    setActiveTagId(null);
    setSearchParams({});
  };

  const handleTagClick = (tagId: string, tagDisplayName: string) => {
    const newActiveTagId = activeTagId === tagId ? null : tagId;
    setActiveTagId(newActiveTagId);

    if (newActiveTagId) {
      setSearchParams({ tag: tagDisplayName });
    } else {
      setSearchParams({});
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, mb: 20 }}>
      <InputBase
        placeholder="Search presets, film sims, tags…"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        fullWidth
        sx={{
          px: 2,
          py: 1,
          borderRadius: 2,
          backgroundColor: "action.hover",
          color: "white",
          mb: 2,
        }}
      />

      <Box sx={{ mb: 2 }}>
        <TagsList
          tags={tags}
          activeTagId={activeTagId}
          onTagClick={handleTagClick}
          onClear={handleClear}
          isLoading={tagsLoading}
        />
      </Box>

      {activeSensor ? (
        activeSensorInfo ? (
          <SensorProfileCard
            sensor={activeSensorInfo}
            filmSimCount={sensorFilmSimCount}
          />
        ) : (
          // Sensor value not in the canonical list (hand-edited URL) — plain
          // filter chip without profile details.
          <Chip
            label={`Film sims for ${activeSensor}`}
            color="secondary"
            onDelete={clearSensor}
          />
        )
      ) : (
        <ContentTypeToggle />
      )}
      <Divider sx={{ my: 2 }} />

      <ContentGridLoader
        contentType={activeSensor ? "films" : contentType}
        searchQuery={keyword}
        presetWhere={presetWhere}
        filmSimWhere={filmSimWhere}
      />
    </Container>
  );
};

export default SearchView;
