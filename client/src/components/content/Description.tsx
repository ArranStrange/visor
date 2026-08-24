import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

interface Tag {
  id: string;
  displayName: string;
}

interface DescriptionProps {
  description?: string;
  tags?: Tag[];
  tagChipSx?: SxProps<Theme>;
  mb?: number;
  children?: React.ReactNode;
}

const Description: React.FC<DescriptionProps> = ({
  description,
  tags = [],
  tagChipSx,
  mb = 2,
  children,
}) => {
  return (
    <Box mb={mb}>
      {description && (
        <Typography variant="body1" color="text.secondary" mb={2}>
          {description}
        </Typography>
      )}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          mb: 2,
          "& > *": {
            marginBottom: 1,
          },
        }}
      >
        {tags
          .filter((tag) => tag && tag.id)
          .map((tag) => (
            <Chip
              key={tag.id}
              label={tag?.displayName || "Unknown"}
              variant="outlined"
              sx={tagChipSx}
            />
          ))}
        {children}
      </Box>
    </Box>
  );
};

export default Description;
