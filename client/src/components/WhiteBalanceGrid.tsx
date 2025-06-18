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

const GRID_SIZE = 19; // -9 to +9
const GRID_RANGE = Array.from(
  { length: GRID_SIZE },
  (_, i) => i - Math.floor(GRID_SIZE / 2)
);

// Blend between four corners: (red, blue, green, magenta)
function getWBColor(r: number, b: number) {
  // Normalize to 0-1
  const normR = (r + 9) / 18;
  const normB = (b + 9) / 18;
  // Corners: TL (green), TR (magenta), BL (blue), BR (red)
  // Interpolate
  const green = (1 - normR) * (1 - normB);
  const magenta = normR * (1 - normB);
  const blue = (1 - normR) * normB;
  const red = normR * normB;
  // Compose RGB
  const R = Math.round(255 * (red + magenta));
  const G = Math.round(255 * green);
  const B = Math.round(255 * (blue + magenta));
  return `rgb(${R},${G},${B})`;
}

const DOT_SIZE = 10;
const DOT_GAP = 5;
const GRID_PIXEL_SIZE = GRID_SIZE * DOT_SIZE + (GRID_SIZE - 1) * DOT_GAP;

const WhiteBalanceGrid: React.FC<WhiteBalanceGridProps> = ({
  value,
  onChange,
}) => {
  return (
    <Box>
      <Box
        sx={{
          position: "relative",
          width: GRID_PIXEL_SIZE,
          height: GRID_PIXEL_SIZE,
          bgcolor: "transparent",
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${DOT_SIZE}px)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, ${DOT_SIZE}px)`,
          gap: `${DOT_GAP}px`,
          borderRadius: 2,
          boxShadow: 2,
          overflow: "visible",
        }}
      >
        {/* Render grid dots */}
        {GRID_RANGE.flatMap((b, rowIdx) =>
          GRID_RANGE.map((r, colIdx) => {
            const isSelected = value.r === r && value.b === b;
            const isCenter = r === 0 && b === 0;
            return (
              <Box
                key={`${r},${b}`}
                onClick={() => onChange({ r, b })}
                sx={{
                  width: DOT_SIZE,
                  height: DOT_SIZE,
                  borderRadius: "50%",
                  bgcolor: getWBColor(r, b),
                  border: isSelected
                    ? "2.5px solid white"
                    : isCenter
                    ? "1.5px solid #fff8"
                    : "1px solid #222",
                  boxSizing: "border-box",
                  cursor: "pointer",
                  position: "relative",
                  zIndex: isSelected ? 2 : 1,
                  transition: "border 0.1s, box-shadow 0.1s",
                  boxShadow: isSelected ? "0 0 0 2px #000" : undefined,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
            );
          })
        )}
        {/* Crosshairs */}
        {/* Vertical */}
        <Box
          sx={{
            position: "absolute",
            left: `calc(50% - 1px)`,
            top: 0,
            width: 2,
            height: "100%",
            bgcolor: "white",
            opacity: 0.7,
            zIndex: 3,
            pointerEvents: "none",
          }}
        />
        {/* Horizontal */}
        <Box
          sx={{
            position: "absolute",
            top: `calc(50% - 1px)`,

            left: 0,
            width: "100%",
            height: 2,
            bgcolor: "white",
            opacity: 0.7,
            zIndex: 3,
            pointerEvents: "none",
          }}
        />
      </Box>
      <Typography
        variant="h6"
        sx={{
          mt: 2,
          textAlign: "left",
          color: "white",
          background: "transparent",
          borderRadius: 1,
          width: GRID_PIXEL_SIZE,
          ml: 0,
          fontFamily: "monospace",
          fontWeight: 500,
          letterSpacing: 2,
        }}
      >
        R:{value.r > 0 ? `+${value.r}` : value.r} B:
        {value.b > 0 ? `+${value.b}` : value.b}
      </Typography>
    </Box>
  );
};

export default WhiteBalanceGrid;
