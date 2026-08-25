import React from "react";
import { Box, Typography } from "@mui/material";

export type WhiteBalanceShift = {
  r: number;
  b: number;
};

interface WhiteBalanceGridProps {
  value: WhiteBalanceShift;
  onChange: (value: WhiteBalanceShift) => void;
}

const GRID_SIZE = 19;
const DOT_SIZE = 10;
const DOT_GAP = 5;

// Matches the camera's WB SHIFT screen: R axis runs cyan (−9, left) to
// red (+9, right); B axis runs yellow (−9, bottom) to blue (+9, top).
// Corners therefore blend to magenta (+R+B), orange (+R−B), cyan-blue
// (−R+B) and green (−R−B), with a neutral white centre.
function getWBColor(r: number, b: number) {
  const x = r / 9;
  const y = b / 9;
  const ax = Math.abs(x);
  const ay = Math.abs(y);
  const strength = Math.max(ax, ay);
  if (strength === 0) return "rgb(255,255,255)";

  const xColor = x > 0 ? [255, 0, 0] : [0, 255, 255];
  const yColor = y > 0 ? [0, 0, 255] : [255, 255, 0];

  const channel = (i: number) => {
    const mixed = (xColor[i] * ax + yColor[i] * ay) / (ax + ay);
    return Math.round(255 * (1 - strength) + mixed * strength);
  };

  return `rgb(${channel(0)},${channel(1)},${channel(2)})`;
}

const WhiteBalanceGrid: React.FC<WhiteBalanceGridProps> = ({
  value,
  onChange,
}) => {
  const gridSize = GRID_SIZE * DOT_SIZE + (GRID_SIZE - 1) * DOT_GAP;
  const range = Array.from({ length: GRID_SIZE }, (_, i) => i - 9);
  // B decreases top-to-bottom so +B (blue) sits at the top, as on-camera.
  const rows = [...range].reverse();

  return (
    <Box sx={{ width: "fit-content" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          B
        </Typography>
        <Box
          sx={{
            position: "relative",
            width: gridSize,
            height: gridSize,
            display: "grid",
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${DOT_SIZE}px)`,
            gap: `${DOT_GAP}px`,
            backgroundColor: "transparent",
          }}
        >
          {rows.flatMap((b) =>
            range.map((r) => {
              const isSelected = value.r === r && value.b === b;

              return (
                <Box
                  key={`${r},${b}`}
                  onClick={() => onChange({ r, b })}
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    width: DOT_SIZE,
                    height: DOT_SIZE,
                    borderRadius: "50%",
                    bgcolor: getWBColor(r, b),
                    border: isSelected ? "2px solid" : "1px solid",
                    borderColor: isSelected ? "common.white" : "divider",
                    cursor: "pointer",
                    transition: "border 0.1s",
                    boxShadow: (theme) =>
                      isSelected
                        ? `0 0 0 1px ${theme.palette.common.black}`
                        : undefined,
                  }}
                />
              );
            })
          )}

          {/* Centre crosshair, as on the camera's WB SHIFT screen */}
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              top: 0,
              width: "1px",
              height: "100%",
              bgcolor: "divider",
              zIndex: 0,
              pointerEvents: "none",
              transform: "translateX(-50%)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: "100%",
              height: "1px",
              bgcolor: "divider",
              zIndex: 0,
              pointerEvents: "none",
              transform: "translateY(-50%)",
            }}
          />
        </Box>
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", textAlign: "center", mt: 0.5 }}
      >
        R
      </Typography>

      <Typography
        variant="subtitle2"
        sx={{
          mt: 1,
          textAlign: "center",
        }}
      >
        R: {value.r > 0 ? `+${value.r}` : value.r} B:{" "}
        {value.b > 0 ? `+${value.b}` : value.b}
      </Typography>
    </Box>
  );
};

export default WhiteBalanceGrid;
