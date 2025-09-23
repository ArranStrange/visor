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

function getWBColor(r: number, b: number) {
  const normR = (r + 9) / 18;
  const normB = (b + 9) / 18;

  const red = Math.round(255 * normR);
  const green = Math.round(255 * (1 - normR) * (1 - normB));
  const blue = Math.round(255 * normB);

  return `rgb(${red},${green},${blue})`;
}

const WhiteBalanceGrid: React.FC<WhiteBalanceGridProps> = ({
  value,
  onChange,
}) => {
  const gridSize = GRID_SIZE * DOT_SIZE + (GRID_SIZE - 1) * DOT_GAP;
  const range = Array.from({ length: GRID_SIZE }, (_, i) => i - 9);

  return (
    <Box>
      <Box
        sx={{
          position: "relative",
          width: gridSize,
          height: gridSize,
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${DOT_SIZE}px)`,
          gap: `${DOT_GAP}px`,
          borderRadius: 2,
          boxShadow: 2,
          backgroundColor: "transparent",
        }}
      >
        {range.flatMap((b) =>
          range.map((r) => {
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
                    ? "2px solid white"
                    : isCenter
                    ? "1px solid rgba(255, 255, 255, 0.5)"
                    : "1px solid #222",
                  cursor: "pointer",
                  zIndex: isSelected ? 2 : 1,
                  transition: "border 0.1s",
                  boxShadow: isSelected ? "0 0 0 1px #000" : undefined,
                }}
              />
            );
          })
        )}

        {/* Crosshairs */}
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: 0,
            width: 1,
            height: "100%",
            bgcolor: "rgba(255, 255, 255, 0.3)",
            zIndex: 3,
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
            height: 1,
            bgcolor: "rgba(255, 255, 255, 0.3)",
            zIndex: 3,
            pointerEvents: "none",
            transform: "translateY(-50%)",
          }}
        />
      </Box>

      <Typography
        variant="body1"
        sx={{
          mt: 2,
          textAlign: "center",
          fontSize: "0.9rem",
          fontWeight: 600,
        }}
      >
        R:{value.r > 0 ? `+${value.r}` : value.r} B:
        {value.b > 0 ? `+${value.b}` : value.b}
      </Typography>
    </Box>
  );
};

export default WhiteBalanceGrid;
