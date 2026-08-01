import React from "react";
import { Box, Typography, Chip, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getSensorByLabel } from "../../constants/fujifilmSensors";

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
  const navigate = useNavigate();

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
        {compatibleSensors.map((sensor) => {
          const info = getSensorByLabel(sensor);
          return (
            <Tooltip
              key={sensor}
              title={
                info
                  ? `Works on: ${info.cameras.join(", ")} — click to see all ${sensor} film sims`
                  : `See all ${sensor} film sims`
              }
            >
              <Chip
                label={sensor}
                color="secondary"
                clickable
                onClick={() =>
                  navigate(`/search?sensor=${encodeURIComponent(sensor)}`)
                }
              />
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

export default FilmSimDescription;
