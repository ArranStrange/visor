import React from "react";
import { Box, Typography } from "@mui/material";

interface SettingSliderDisplayProps {
  label: string;
  value: number | string;
  spectrum?: string; // Optional CSS linear-gradient
}

const SettingSliderDisplay: React.FC<SettingSliderDisplayProps> = ({
  label,
  value,
  spectrum,
}) => {
  const parsed = parseFloat(value.toString());
  if (isNaN(parsed)) return null;

  const isExposure = label.toLowerCase() === "exposure";
  const isGrain = label.toLowerCase() === "grain";

  const min = isExposure ? -5 : isGrain ? 0 : -100;
  const max = isExposure ? 5 : isGrain ? 100 : 100;

  const clamped = Math.max(min, Math.min(parsed, max));
  const range = max - min;

  const center = ((0 - min) / range) * 100;
  const valuePercent = ((clamped - min) / range) * 100;
  const fromCenter = valuePercent - center;
  const fillWidth = Math.abs(fromCenter);

  const displayValue = parsed > 0 ? `+${parsed}` : parsed.toString();

  return (
    <Box sx={{ mb: 2 }}>
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

      <Box
        sx={{
          position: "relative",
          height: 6,
          borderRadius: 3,
          background: spectrum ? spectrum : (theme) => theme.palette.divider,
        }}
      >
        {/* Fill from center */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            height: "100%",
            width: `${fillWidth}%`,
            backgroundColor: "#fff",
            left: `${fromCenter >= 0 ? center : center - fillWidth}%`,
            borderRadius: 3,
            opacity: spectrum ? 0.3 : 1,
          }}
        />

        {/* Handle */}
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
