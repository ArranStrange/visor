import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

interface FilmSimCardProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  tags?: Array<{
    id?: string;
    displayName: string;
  }>;
  creator?: {
    username: string;
    avatarUrl?: string;
  };
  settings?: {
    dynamicRange?: string;
    highlight?: string;
    shadow?: string;
    colour?: string;
    sharpness?: string;
    noiseReduction?: string;
    grainEffect?: string;
    clarity?: string;
    whiteBalance?: string;
    wbShift?: {
      r: number;
      b: number;
    };
  };
}

const FilmSimCard: React.FC<FilmSimCardProps> = ({
  id,
  name,
  slug,
  description,
  thumbnail,
  tags = [],
  creator = { username: "Unknown" },
  settings,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/filmsim/${slug}`);
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 3,
        },
      }}
      onClick={handleClick}
    >
      <CardMedia
        component="img"
        height="200"
        image={thumbnail || "/placeholder-image.jpg"}
        alt={name}
        sx={{ objectFit: "cover" }}
      />
      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <Typography gutterBottom variant="h6" component="div">
          {name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            mb: 2,
          }}
        >
          {description}
        </Typography>
        <Box sx={{ mt: "auto" }}>
          <Stack
            direction="row"
            gap={1}
            m={1}
            flexWrap="wrap"
            justifyContent="start"
            sx={{ minWidth: "100%" }}
          >
            {(tags ?? []).slice(0, 3).map((tag, index) => (
              <Chip
                key={`${id}-tag-${index}-${tag.id ?? tag.displayName}`}
                label={tag.displayName}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FilmSimCard;
