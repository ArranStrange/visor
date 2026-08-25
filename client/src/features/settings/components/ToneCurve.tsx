import React, { useState } from "react";
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
} from "@mui/material";
import { TONE_CURVE_CHANNEL_COLORS } from "@/constants/xmpSettingsConfig";

interface ToneCurveProps {
  curves: {
    rgb: number[];
    red: number[];
    green: number[];
    blue: number[];
  };
}

const ToneCurveChart: React.FC<{
  input: number[];
  output: number[];
  stroke: string;
}> = ({ input, output, stroke }) => {
  const theme = useTheme();
  const points = input
    .map((x, i) => `${(x / 255) * 100},${100 - (output[i] / 255) * 100}`)
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="200"
      preserveAspectRatio="none"
      style={{ background: theme.palette.surface.sunken, borderRadius: 8 }}
    >
      <rect
        x="0"
        y="0"
        width="100"
        height="100"
        fill="none"
        stroke={theme.palette.surface.outline}
        strokeWidth="0.5"
      />
      <polyline fill="none" stroke={stroke} strokeWidth="2" points={points} />
    </svg>
  );
};

const ToneCurve: React.FC<ToneCurveProps> = ({ curves }) => {
  const theme = useTheme();
  const [channel, setChannel] = useState("rgb");

  const input = [0, 64, 128, 192, 255];
  const output = curves[channel as keyof typeof curves];

  const getStrokeColour = (ch: string) => {
    switch (ch) {
      case "red":
        return theme.palette.error.main;
      case "green":
        return theme.palette.success.main;
      case "blue":
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  return (
    <Box>
      <ToggleButtonGroup
        value={channel}
        exclusive
        onChange={(_, val) => val && setChannel(val)}
        size="small"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="rgb">RGB</ToggleButton>
        <ToggleButton value="red">
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              backgroundColor: TONE_CURVE_CHANNEL_COLORS.red,
            }}
          />
        </ToggleButton>
        <ToggleButton value="green">
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              backgroundColor: TONE_CURVE_CHANNEL_COLORS.green,
            }}
          />
        </ToggleButton>
        <ToggleButton value="blue">
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              backgroundColor: TONE_CURVE_CHANNEL_COLORS.blue,
            }}
          />
        </ToggleButton>
      </ToggleButtonGroup>

      <ToneCurveChart
        input={input}
        output={output}
        stroke={getStrokeColour(channel)}
      />
    </Box>
  );
};

export default ToneCurve;
