import React from "react";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CheckIcon from "@mui/icons-material/Check";
import {
  FujifilmSensor,
  SensorFeatures,
} from "@/features/film-sims/utils/fujifilmSensors";

const FEATURE_LABELS: Record<keyof SensorFeatures, string> = {
  grainEffect: "Grain Effect",
  grainSize: "Grain Size",
  colorChromeEffect: "Color Chrome Effect",
  colorChromeFXBlue: "Color Chrome FX Blue",
  clarity: "Clarity",
  classicNegative: "Classic Negative",
  nostalgicNegative: "Nostalgic Negative",
  realaAce: "Reala Ace",
};

interface SensorProfileCardProps {
  sensor: FujifilmSensor;
  filmSimCount?: number | null;
}

/**
 * Header card for the sensor-filtered film sim view: which cameras carry the
 * sensor, what the generation supports, and what it can't do. Rendered on a
 * raised tonal surface so photos stay the brightest element on the page.
 */
const SensorProfileCard: React.FC<SensorProfileCardProps> = ({
  sensor,
  filmSimCount,
}) => {
  const featureKeys = Object.keys(FEATURE_LABELS) as (keyof SensorFeatures)[];
  const supported = featureKeys.filter((key) => sensor.features[key]);
  const unsupported = featureKeys.filter((key) => !sensor.features[key]);

  return (
    <Paper
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        backgroundColor: "surface.raised",
        border: "1px solid",
        borderColor: "surface.border",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <CameraAltIcon color="secondary" sx={{ mt: 0.5 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="baseline" spacing={1.5}>
            <Typography variant="h5" fontWeight={700}>
              {sensor.label}
            </Typography>
            {typeof filmSimCount === "number" && (
              <Typography variant="caption" color="text.secondary">
                {filmSimCount} film sim{filmSimCount === 1 ? "" : "s"}
              </Typography>
            )}
          </Stack>

          {sensor.notes && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {sensor.notes}
            </Typography>
          )}

          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ display: "block", mt: 1.5 }}
          >
            Works on
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            {sensor.cameras.map((camera) => (
              <Chip
                key={camera}
                label={camera}
                size="small"
                variant="outlined"
                sx={{ borderColor: "surface.outline" }}
              />
            ))}
          </Stack>

          {supported.length > 0 && (
            <>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ display: "block", mt: 1.5 }}
              >
                Supports
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.75}>
                {supported.map((key) => (
                  <Chip
                    key={key}
                    label={FEATURE_LABELS[key]}
                    size="small"
                    color="secondary"
                    variant="outlined"
                    icon={<CheckIcon />}
                  />
                ))}
              </Stack>
            </>
          )}

          {unsupported.length > 0 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1.5, opacity: 0.8 }}
            >
              Not available on this sensor:{" "}
              {unsupported.map((key) => FEATURE_LABELS[key]).join(", ")}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default SensorProfileCard;
