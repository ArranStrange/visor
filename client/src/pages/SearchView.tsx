import React, { useState, useEffect } from "react";
import {
  Box,
  Chip,
  Container,
  InputBase,
  Divider,
  Typography,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { useSearchParams } from "react-router-dom";
import { getSensorByLabel } from "../constants/fujifilmSensors";

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
    ? activeSensorInfo?.label ?? sensorParam
    : null;

  const clearSensor = () => {
    searchParams.delete("sensor");
    setSearchParams(searchParams);
  };

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
          backgroundColor: "rgba(255,255,255,0.08)",
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
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              icon={<CameraAltIcon />}
              label={`Film sims for ${activeSensor}`}
              color="secondary"
              onDelete={clearSensor}
            />
          </Box>
          {activeSensorInfo && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1 }}
            >
              Works on {activeSensorInfo.cameras.join(", ")}
            </Typography>
          )}
        </Box>
      ) : (
        <ContentTypeToggle />
      )}
      <Divider sx={{ my: 2 }} />

      <ContentGridLoader
        contentType={activeSensor ? "films" : contentType}
        searchQuery={keyword}
        filter={
          activeSensor
            ? {
                ...(activeTagId ? { tagId: activeTagId } : {}),
                compatibleSensors: activeSensor,
              }
            : activeTagId
            ? { tagId: activeTagId }
            : undefined
        }
      />
    </Container>
  );
};

export default SearchView;
