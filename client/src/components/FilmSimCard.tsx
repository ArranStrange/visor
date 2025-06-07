import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

interface FilmSimCardProps {
  id: string;
  title: string;
  thumbnail: string;
  tags: string[];
  toneProfile?: string;
}

const FilmSimCard: React.FC<FilmSimCardProps> = ({
  id,
  title,
  thumbnail,
  tags,
  toneProfile,
}) => {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        backgroundColor: "background.paper",
        borderRadius: 3,
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        },
      }}
      onClick={() => navigate(`/filmsim/${id}`)}
    >
      <CardMedia
        component="img"
        image={thumbnail}
        alt={title}
        height="180"
        sx={{
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          objectFit: "cover",
        }}
      />
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
          {title}
        </Typography>

        {toneProfile && (
          <Typography variant="caption" color="text.secondary" gutterBottom>
            {toneProfile}
          </Typography>
        )}

        <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
          {tags.slice(0, 3).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant="outlined"
              sx={{
                color: "text.secondary",
                borderColor: "divider",
              }}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FilmSimCard;
