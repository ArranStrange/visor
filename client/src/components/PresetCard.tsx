import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Stack,
  Chip,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

interface PresetCardProps {
  id: string;
  title: string;
  thumbnail: string;
  tags: string[];
  creator: {
    username: string;
    avatarUrl?: string;
  };
}

const PresetCard: React.FC<PresetCardProps> = ({
  id,
  title,
  thumbnail,
  tags,
  creator,
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
      onClick={() => navigate(`/preset/${id}`)}
    >
      <Box sx={{ position: "relative" }}></Box>
      <CardMedia
        component="img"
        image={thumbnail}
        alt={title}
        sx={{
          minWidth: "100%",
          height: "fit-content",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          objectFit: "cover",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 30,
          backgroundColor: "rgba(0,0,0,0.7)",
          color: "#fff",
          px: 0.5,
          py: 0.5,
          borderRadius: 1,
          fontSize: "0.7rem",
          fontWeight: "bold",
          textTransform: "uppercase",
        }}
      >
        Lightroom Preset
      </Box>

      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
          {title}
        </Typography>

        <Box display="flex" alignItems="center" gap={1} mb={1}>
          {creator.avatarUrl && (
            <img
              src={creator.avatarUrl}
              alt={creator.username}
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          )}
          <Typography variant="caption" color="text.secondary">
            {creator.username}
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={{ sm: 1 }}
          display={{ xs: "none", s: "none", md: "flex" }}
          flexWrap="nowrap"
        >
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

export default PresetCard;
