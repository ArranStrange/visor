import React, { useState } from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useContentType } from "../context/ContentTypeFilter";

// Icons
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
    // console.log('Shuffle button clicked', { currentRandomizeOrder: randomizeOrder });
    setRandomizeOrder(!randomizeOrder);
    // Always trigger shuffle when button is clicked
    triggerShuffle();
    // console.log('triggerShuffle called');
  };

  const options = [
    {
      title: "All",
      value: "all",
      icon: <DashboardCustomizeIcon />,
      description: "Show all content types",
    },
    {
      title: "Presets",
      value: "presets",
      icon: <TuneIcon />,
      description: "Show only Lightroom presets",
    },
    {
      title: "Film Sims",
      value: "films",
      icon: <CameraRollIcon />,
      description: "Show only film simulations",
    },
  ] as const;

  return (
    <Box
      data-cy="content-type-toggle"
      position="relative"
      display="flex"
      justifyContent="center"
      alignItems="center"
      mt={2}
      mb={2}
      role="group"
      aria-label="Content type filter"
    >
      <ToggleButtonGroup
        value={contentType}
        exclusive
        onChange={handleChange}
        aria-label="Filter content by type"
        sx={{
          backgroundColor: "background.default",
          borderRadius: "999px",
          boxShadow: 1,
          p: 0.5,
          gap: 0.5,
        }}
      >
        {options.map(({ value, icon, title, description }) => (
          <Tooltip key={value} title={title} arrow>
            <ToggleButton
              data-cy={`filter-${value}`}
              value={value}
              aria-label={`${title}: ${description}`}
              aria-pressed={contentType === value}
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
                "&:focus-visible": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
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
        arrow
      >
        <IconButton
          onClick={handleShuffleClick}
          aria-label={
            randomizeOrder ? "Disable random order" : "Enable random order"
          }
          aria-pressed={randomizeOrder}
          sx={{
            position: "absolute",
            right: 0,
            backgroundColor: "transparent",
            color: randomizeOrder ? "#ff9800" : "grey.600",
            opacity: 0.7,
            "&:hover": {
              opacity: 1,
            },
            "&:focus-visible": {
              outline: "2px solid",
              outlineColor: "primary.main",
              outlineOffset: "2px",
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
