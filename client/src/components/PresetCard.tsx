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
  afterImage?: any;
  description?: string;
  tags: { displayName: string }[];
}

const PresetCard: React.FC<PresetCardProps> = ({
  id,
  slug,
  title,
  afterImage,
  description,
  tags,
}) => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = React.useState(false);

  // Determine the correct image URL
  let imageUrl = PLACEHOLDER_IMAGE;
  if (afterImage) {
    if (typeof afterImage === "string") {
      imageUrl = afterImage;
    } else if (typeof afterImage === "object" && afterImage.url) {
      imageUrl = afterImage.url;
    }
  }

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
        onLoad={() => setLoaded(true)}
        sx={{
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          objectFit: "cover",
          filter: loaded ? "none" : "blur(16px)",
          transition: "filter 0.4s cubic-bezier(.4,0,.2,1)",
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

        <Stack
          direction="row"
          gap={1}
          m={0.5}
          flexWrap="wrap"
          justifyContent="start"
          sx={{ minWidth: "100%" }}
        >
          {tags.slice(0, 3).map((tag, index) => (
            <Chip
              key={index}
              label={tag.displayName}
              size="small"
              variant="outlined"
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PresetCard;
