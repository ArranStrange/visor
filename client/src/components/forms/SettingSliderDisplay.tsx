import React from "react";
import { Box, Typography } from "@mui/material";

interface SettingSliderDisplayProps {
  label: string;
  value: number | string;
  spectrum?: string;
  showLabel?: boolean;
}

interface SliderRange {
  min: number;
  max: number;
}

const DEFAULT_SLIDER_RANGE: SliderRange = { min: -100, max: 100 };
const SLIDER_RANGES: Record<string, SliderRange> = {
  exposure: { min: -5, max: 5 },
  grain: { min: 0, max: 100 },
};

const SettingSliderDisplay: React.FC<SettingSliderDisplayProps> = ({
  label,
  value,
  spectrum,
  showLabel = false,
}) => {
  const parsed = parseFloat(value.toString());
  if (isNaN(parsed)) return null;

  const { min, max } =
    SLIDER_RANGES[label.toLowerCase()] ?? DEFAULT_SLIDER_RANGE;

  const clamped = Math.max(min, Math.min(parsed, max));
  const range = max - min;

  const center = ((0 - min) / range) * 100;
  const valuePercent = ((clamped - min) / range) * 100;
  const fromCenter = valuePercent - center;
  const fillWidth = Math.abs(fromCenter);

  const displayValue = parsed > 0 ? `+${parsed}` : parsed.toString();

  return (
    <Box sx={{ mb: showLabel ? 2 : 0 }}>
      {showLabel && (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={0.5}
        >
          <Typography variant="body2" fontWeight={500}>
            {label}
          </Typography>
          <Typography
            variant="body2"
            fontWeight={500}
            color="text.secondary"
            sx={{ minWidth: 40, textAlign: "right" }}
          >
            {displayValue}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          position: "relative",
          height: 6,
          borderRadius: 3,
          background: spectrum ? spectrum : (theme) => theme.palette.divider,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            height: "100%",
            width: `${fillWidth}%`,
            backgroundColor: "common.white",
            left: `${fromCenter >= 0 ? center : center - fillWidth}%`,
            borderRadius: 3,
            opacity: spectrum ? 0.3 : 1,
          }}
        />

        <Box
          sx={{
            position: "absolute",
            top: -3,
            left: `${valuePercent}%`,
            transform: "translateX(-50%)",
            width: 12,
            height: 12,
            borderRadius: "50%",
            border: "2px solid white",
            backgroundColor: "text.secondary",
          }}
        />
      </Box>
    </Box>
  );
};

export default SettingSliderDisplay;
