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
import { ENV_CONFIG } from "@/config/environment";
import { useCamera } from "@/context/CameraContext";

import { useDebouncedValue } from "../hooks/useDebouncedValue";
import ContentTypeToggle from "../components/ui/ContentTypeToggle";
import SortControl from "../components/ui/SortControl";
import ContentGridLoader from "../components/ui/ContentGridLoader";
import TagsList from "../components/ui/TagsList";
import { useContentType } from "../context/ContentTypeFilter";
import { useTags } from "../context/TagContext";

const SearchView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const { contentType } = useContentType();
  // The input stays bound to `keyword` so typing never feels laggy; only the
  // query trails it. Search is server-side, so an undebounced value would mean
  // a round trip (and a new cache entry) per keystroke.
  const search = useDebouncedValue(keyword).trim() || undefined;
  const { tags, loading: tagsLoading, searchTags } = useTags();
  const {
    camera,
    sensorKey: cameraSensorKey,
    showAllGenerations,
    setShowAllGenerations,
  } = useCamera();

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

  // The user's own body narrows film sims to their sensor generation, unless
  // they've asked to see everything or pinned a generation explicitly via the
  // URL — an explicit choice always beats the implicit one.
  const personalSensorKey =
    ENV_CONFIG.ENABLE_CAMERA_FILTER &&
    !showAllGenerations &&
    !activeSensorKey &&
    cameraSensorKey
      ? cameraSensorKey
      : null;
  const effectiveSensorKey = activeSensorKey ?? personalSensorKey;

  // Memoised so the query variables keep their identity across renders and
  // Apollo doesn't treat every render as a new cache entry.
  const presetWhere = useMemo(
    () => (activeTagId ? { tagId: activeTagId } : undefined),
    [activeTagId]
  );
  const filmSimWhere = useMemo(
    () =>
      activeTagId || effectiveSensorKey
        ? {
            ...(activeTagId ? { tagId: activeTagId } : {}),
            ...(effectiveSensorKey ? { sensorKey: effectiveSensorKey } : {}),
          }
        : undefined,
    [activeTagId, effectiveSensorKey]
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

      {/*
        Outside the sensor conditional above: in sensor mode the content-type
        toggle is replaced by the profile card, but the grid still lists film
        sims that need ordering, so a sort control nested in that branch would
        simply vanish.
      */}
      <SortControl />

      {!activeSensor && camera && ENV_CONFIG.ENABLE_CAMERA_FILTER && (
        // Never narrow the results silently: say which body is filtering and
        // offer the way out in the same breath.
        <Box sx={{ mt: 2 }}>
          <Chip
            variant="outlined"
            label={
              showAllGenerations
                ? "Showing every generation"
                : `Film sims that fit your ${camera.name}`
            }
            onClick={() => setShowAllGenerations(!showAllGenerations)}
          />
        </Box>
      )}
      <Divider sx={{ my: 2 }} />

      <ContentGridLoader
        contentType={activeSensor ? "films" : contentType}
        search={search}
        presetWhere={presetWhere}
        filmSimWhere={filmSimWhere}
      />
    </Container>
  );
};

export default SearchView;
