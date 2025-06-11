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

const WhiteBalanceGrid: React.FC<WhiteBalanceGridProps> = ({
  value,
  onChange,
}) => {
  const handleClick = (r: number, b: number) => {
    onChange({ r, b });
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        White Balance Shift
      </Typography>
      <Box
        sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1 }}
      >
        {[-2, -1, 0, 1, 2].map((r) =>
          [-2, -1, 0, 1, 2].map((b) => (
            <Box
              key={`${r}-${b}`}
              onClick={() => handleClick(r, b)}
              sx={{
                width: "100%",
                paddingTop: "100%",
                position: "relative",
                cursor: "pointer",
                bgcolor:
                  value.r === r && value.b === b ? "primary.main" : "grey.200",
                "&:hover": {
                  bgcolor: "primary.light",
                },
              }}
            />
          ))
        )}
      </Box>
    </Box>
  );
};

export default WhiteBalanceGrid;
