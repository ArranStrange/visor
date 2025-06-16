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

// Placeholder image for presets without thumbnails
const PLACEHOLDER_IMAGE =
  "https://placehold.co/600x400/2a2a2a/ffffff?text=No+Image";

interface PresetCardProps {
  id: string;
  slug: string;
  title: string;
  afterImage?: any; // Accept object or string for flexibility
  tags: { displayName: string }[];
  creator: {
    username: string;
    avatarUrl?: string;
  };
}

const PresetCard: React.FC<PresetCardProps> = ({
  id,
  slug,
  title,
  afterImage,
  tags,
  creator,
}) => {
  const navigate = useNavigate();

  // Determine the correct image URL
  let imageUrl = PLACEHOLDER_IMAGE;
  if (afterImage) {
    if (typeof afterImage === "string") {
      imageUrl = afterImage;
    } else if (typeof afterImage === "object" && afterImage.url) {
      imageUrl = afterImage.url;
    }
  }

  console.log("PresetCard afterImage:", afterImage, "imageUrl:", imageUrl);

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
      onClick={() => navigate(`/preset/${slug}`)}
    >
      <CardMedia
        component="img"
        image={imageUrl}
        alt={title}
        height="180"
        sx={{
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
          {creator?.avatarUrl && (
            <img
              src={creator.avatarUrl}
              alt={creator.username ?? "Unknown"}
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          )}
          <Typography variant="caption" color="text.secondary">
            {creator?.username ?? "Unknown"}
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={{ sm: 1 }}
          display={{ xs: "none", s: "none", md: "flex" }}
          flexWrap="nowrap"
        >
          {tags.slice(0, 3).map((tag, index) => (
            <Chip
              key={index}
              label={tag.displayName}
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
