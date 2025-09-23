import React, { useState } from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useContentType } from "../../context/ContentTypeFilter";

import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import TuneIcon from "@mui/icons-material/Tune";
import CameraRollIcon from "@mui/icons-material/CameraRoll";
import ShuffleIcon from "@mui/icons-material/Shuffle";

const ContentTypeToggle: React.FC = () => {
  const {
    contentType,
    setContentType,
    randomizeOrder,
    setRandomizeOrder,
    triggerShuffle,
  } = useContentType();

  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    newValue: "all" | "presets" | "films" | null
  ) => {
    if (newValue) setContentType(newValue);
  };

  const handleShuffleClick = () => {
    setRandomizeOrder(!randomizeOrder);
    triggerShuffle();
  };

  const options = [
    { title: "All", value: "all", icon: <DashboardCustomizeIcon /> },
    { title: "Presets", value: "presets", icon: <TuneIcon /> },
    { title: "Film Sims", value: "films", icon: <CameraRollIcon /> },
  ] as const;

  return (
    <Box
      position="relative"
      display="flex"
      justifyContent="center"
      alignItems="center"
      mt={2}
      mb={2}
    >
      <ToggleButtonGroup
        value={contentType}
        exclusive
        onChange={handleChange}
        sx={{
          backgroundColor: "background.default",
          borderRadius: "999px",
          boxShadow: 1,
          p: 0.5,
          gap: 0.5,
        }}
      >
        {options.map(({ value, icon, title }) => (
          <Tooltip key={value} title={title} arrow>
            <ToggleButton
              value={value}
              sx={{
                border: "none",
                borderRadius: "999px",
                textTransform: "none",
                px: 3,
                py: 1,
                fontWeight: "medium",
                fontSize: "0.9rem",
                color: (theme) =>
                  contentType === value
                    ? theme.palette.primary.contrastText
                    : theme.palette.text.primary,
                backgroundColor: (theme) =>
                  contentType === value
                    ? theme.palette.primary.main
                    : "transparent",
                "&:hover": {
                  backgroundColor: (theme) =>
                    contentType === value
                      ? theme.palette.primary.dark
                      : theme.palette.action.hover,
                },
              }}
            >
              {icon}
            </ToggleButton>
          </Tooltip>
        ))}
      </ToggleButtonGroup>

      <Tooltip
        title={randomizeOrder ? "Disable Random Order" : "Enable Random Order"}
      >
        <IconButton
          onClick={handleShuffleClick}
          sx={{
            position: "absolute",
            right: 0,
            backgroundColor: "transparent",
            color: randomizeOrder ? "#ff9800" : "grey.600",
            opacity: 0.7,
            "&:hover": {
              opacity: 1,
            },
          }}
          size="small"
        >
          <ShuffleIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ContentTypeToggle;
