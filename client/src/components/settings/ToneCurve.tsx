import React, { useState } from "react";
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";

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
  const points = input
    .map((x, i) => `${(x / 255) * 100},${100 - (output[i] / 255) * 100}`)
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="200"
      preserveAspectRatio="none"
      style={{ background: "#111", borderRadius: 8 }}
    >
      <rect
        x="0"
        y="0"
        width="100"
        height="100"
        fill="none"
        stroke="#333"
        strokeWidth="0.5"
      />
      <polyline fill="none" stroke={stroke} strokeWidth="2" points={points} />
    </svg>
  );
};

const ToneCurve: React.FC<ToneCurveProps> = ({ curves }) => {
  const [channel, setChannel] = useState("rgb");

  const input = [0, 64, 128, 192, 255];
  const output = curves[channel as keyof typeof curves];

  const getStrokeColour = (ch: string) => {
    switch (ch) {
      case "red":
        return "#f44336";
      case "green":
        return "#4caf50";
      case "blue":
        return "#2196f3";
      default:
        return "#ccc";
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
              backgroundColor: "red",
            }}
          />
        </ToggleButton>
        <ToggleButton value="green">
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              backgroundColor: "green",
            }}
          />
        </ToggleButton>
        <ToggleButton value="blue">
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              backgroundColor: "blue",
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
