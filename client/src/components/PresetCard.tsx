import React from "react";
import {
  Card,
  CardMedia,
  Typography,
  Chip,
  Box,
  Avatar,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import AddToListDialog from "./AddToListDialog";

// Placeholder image for presets without thumbnails
const PLACEHOLDER_IMAGE =
  "https://placehold.co/600x400/2a2a2a/ffffff?text=No+Image";

interface PresetCardProps {
  slug: string;
  title: string;
  afterImage?: any;
  tags: { displayName: string }[];
  creator?: {
    username: string;
    avatar?: string;
    id?: string;
  };
  id?: string;
}

const PresetCard: React.FC<PresetCardProps> = ({
  slug,
  title,
  afterImage,
  tags,
  creator,
  id,
}) => {
  const navigate = useNavigate();
  const [addToListOpen, setAddToListOpen] = React.useState(false);

  // Determine the correct image URL
  let imageUrl = PLACEHOLDER_IMAGE;
  if (afterImage) {
    if (typeof afterImage === "string") {
      imageUrl = afterImage;
    } else if (typeof afterImage === "object" && afterImage.url) {
      imageUrl = afterImage.url;
    }
  }

  const handleAddToList = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAddToListOpen(true);
  };

  const handleCloseDialog = () => {
    setAddToListOpen(false);
  };

  const handleCardClick = () => {
    if (!addToListOpen) {
      navigate(`/preset/${slug}`);
    }
  };

  return (
    <Card
      sx={{
        position: "relative",
        aspectRatio: "3/4", // Slightly longer than 4/3
        borderRadius: 1,
        cursor: "pointer",
        overflow: "hidden", // to contain the overlay and for border-radius on image
        "&:hover .tags-overlay": {
          opacity: 1,
        },
        "&:hover .title-overlay": {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
        "&:hover .creator-avatar": {
          opacity: 1,
        },
        "&:hover .add-to-list-button": {
          opacity: 1,
        },
      }}
      onClick={handleCardClick}
    >
      <CardMedia
        component="div"
        sx={{
          height: "100%",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundImage: `url(${imageUrl})`,
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "scale(1.05)",
          },
        }}
      />

      {/* Add to List Button */}
      <Box
        className="add-to-list-button"
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 10,
          opacity: 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        <IconButton
          onClick={handleAddToList}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            width: 32,
            height: 32,
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.9)",
            },
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Creator Avatar */}
      {creator && (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 2,
            opacity: 0,
            transition: "opacity 0.3s ease-in-out",
            cursor: "pointer",
          }}
          className="creator-avatar"
          onClick={(e) => {
            e.stopPropagation();
            if (creator.id) {
              navigate(`/profile/${creator.id}`);
            }
          }}
        >
          <Avatar
            src={creator.avatar}
            alt={creator.username}
            sx={{
              width: 32,
              height: 32,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
            }}
          >
            {creator.username.charAt(0).toUpperCase()}
          </Avatar>
        </Box>
      )}

      <Box
        className="title-overlay"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          textAlign: "center",
          transition: "background-color 0.3s ease-in-out",
          p: 2,
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ textShadow: "2px 2px 4px rgba(0,0,0,0.7)" }}
        >
          {title}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ textShadow: "1px 1px 2px rgba(0,0,0,0.7)" }}
        >
          Lightroom Preset
        </Typography>
      </Box>

      <Box
        className="tags-overlay"
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          p: 1.5,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
          opacity: 0,
          transition: "opacity 0.3s ease-in-out",
          display: "flex",
          flexWrap: "wrap",
          gap: 0.5,
          justifyContent: "flex-start",
        }}
      >
        {tags
          .slice(0, 3)
          .reverse()
          .map((tag, index) => (
            <Chip
              key={index}
              label={tag.displayName}
              size="small"
              sx={{
                color: "white",
                backgroundColor: "black",
                border: "none",
                cursor: "pointer",
                "& .MuiChip-label": {
                  color: "white",
                },
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/search?tag=${encodeURIComponent(tag.displayName)}`);
              }}
            />
          ))}
      </Box>

      <AddToListDialog
        open={addToListOpen}
        onClose={handleCloseDialog}
        presetId={id}
        itemName={title}
      />
    </Card>
  );
};

export default PresetCard;
