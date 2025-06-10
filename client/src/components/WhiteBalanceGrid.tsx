import React from "react";
import { Box, Typography } from "@mui/material";

interface WhiteBalanceGridProps {
  value: [number, number]; // [R, B] from -2 to +2
  onChange?: (value: [number, number]) => void;
}

const WhiteBalanceGrid: React.FC<WhiteBalanceGridProps> = ({
  value,
  onChange,
}) => {
  const gridSize = 5;
  const cellSize = 40;
  const grid = Array.from({ length: gridSize }, (_, i) => i - 2); // [-2, -1, 0, 1, 2]

  const handleClick = (x: number, y: number) => {
    if (onChange) onChange([x, y]);
  };

  return (
    <Box sx={{ display: "inline-block" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {grid.map((y) =>
          grid.map((x) => {
            const isSelected = x === value[0] && y === value[1];
            return (
              <Box
                key={`${x},${y}`}
                onClick={() => handleClick(x, y)}
                sx={{
                  width: cellSize,
                  height: cellSize,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: isSelected ? "primary.main" : "transparent",
                  cursor: onChange ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isSelected ? "primary.contrastText" : "text.secondary",
                  fontSize: "0.8rem",
                  userSelect: "none",
                }}
              >
                {isSelected ? "●" : ""}
              </Box>
            );
          })
        )}
      </Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 1, textAlign: "center" }}
      >
        {value[0] >= 0 ? `+${value[0]}` : value[0]} R,&nbsp;
        {value[1] >= 0 ? `+${value[1]}` : value[1]} B
      </Typography>
    </Box>
  );
};

export default WhiteBalanceGrid;
