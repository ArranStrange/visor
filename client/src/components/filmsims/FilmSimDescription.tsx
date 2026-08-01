import React from "react";
import { Box, Typography, Chip } from "@mui/material";

interface Tag {
  id: string;
  displayName: string;
}

interface FilmSimDescriptionProps {
  description?: string;
  tags?: Tag[];
  compatibleSensors?: string[];
}

const FilmSimDescription: React.FC<FilmSimDescriptionProps> = ({
  description,
  tags = [],
  compatibleSensors = [],
}) => {
  return (
    <Box mb={2}>
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
          ?.filter((tag) => tag && tag.id)
          .map((tag) => (
            <Chip
              key={tag.id}
              label={tag?.displayName || "Unknown"}
              variant="outlined"
            />
          ))}
        {compatibleSensors.map((sensor) => (
          <Chip key={sensor} label={sensor} color="secondary" />
        ))}
      </Box>
    </Box>
  );
};

export default FilmSimDescription;
