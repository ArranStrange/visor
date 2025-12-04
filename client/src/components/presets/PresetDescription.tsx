import React from "react";
import { Box, Typography, Chip } from "@mui/material";

interface Tag {
  id: string;
  displayName: string;
}

interface Preset {
  description?: string;
  tags?: Tag[];
}

interface PresetDescriptionProps {
  preset: Preset;
}

const PresetDescription: React.FC<PresetDescriptionProps> = ({ preset }) => {
  const { description, tags = [] } = preset;
  return (
    <Box mb={3}>
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
          mt: 2,
          "& > *": {
            marginBottom: 1,
          },
        }}
      >
        {tags.map((tag) => (
          <Chip
            key={tag.id}
            label={tag?.displayName || "Unknown"}
            variant="outlined"
            sx={{ color: "text.secondary", borderColor: "divider" }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default PresetDescription;
