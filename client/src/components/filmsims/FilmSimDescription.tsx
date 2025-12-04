import React from "react";
import { Box, Typography, Chip } from "@mui/material";

interface Tag {
  id: string;
  displayName: string;
}

interface FilmSim {
  description?: string;
  tags?: Tag[];
  compatibleCameras?: string[];
}

interface FilmSimDescriptionProps {
  filmSim: FilmSim;
}

const FilmSimDescription: React.FC<FilmSimDescriptionProps> = ({ filmSim }) => {
  const { description, tags = [], compatibleCameras = [] } = filmSim;
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
        {compatibleCameras.map((camera) => (
          <Chip key={camera} label={camera} color="secondary" />
        ))}
      </Box>
    </Box>
  );
};

export default FilmSimDescription;
