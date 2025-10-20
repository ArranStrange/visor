import React, { memo, useCallback, useMemo } from "react";
import { Card, Typography, Box, Avatar, Stack, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ImageOptimizer from "../media/ImageOptimizer";
import {
  overlayAvatarStyles,
  overlayTitleContainerStyles,
  getCardHoverStyles,
} from "../../styles/cardOverlays";

const placeholderImage = "/placeholder-image.jpg";

interface ListCardProps {
  id: string;
  name: string;
  description?: string;
  owner: {
    id: string;
    username: string;
    avatar?: string;
  };
  presets?: Array<{
    id: string;
    title: string;
    slug: string;
    afterImage?: {
      id: string;
      url: string;
    };
  }>;
  filmSims?: Array<{
    id: string;
    name: string;
    slug: string;
    sampleImages?: Array<{
      id: string;
      url: string;
    }>;
  }>;
}

const ListCard: React.FC<ListCardProps> = memo(
  ({ id, name, description, owner, presets = [], filmSims = [] }) => {
    const navigate = useNavigate();
    const [showOptions, setShowOptions] = React.useState(false);

    // Get thumbnail images from presets and film sims
    const thumbnails = useMemo(() => {
      const images: string[] = [];

      // Add preset images
      presets.forEach((preset) => {
        if (preset.afterImage?.url) {
          images.push(preset.afterImage.url);
        }
      });

      // Add film sim images
      filmSims.forEach((filmSim) => {
        if (filmSim.sampleImages?.[0]?.url) {
          images.push(filmSim.sampleImages[0].url);
        }
      });

      // Return up to 4 images for the grid, or placeholder if none
      if (images.length === 0) {
        return [placeholderImage];
      }
      return images.slice(0, 4);
    }, [presets, filmSims]);

    const totalItems = presets.length + filmSims.length;

    const handleCardClick = useCallback(() => {
      navigate(`/list/${id}`);
    }, [navigate, id]);

    const handleOwnerClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/profile/${owner.id}`);
      },
      [navigate, owner.id]
    );

    const cardStyles = useMemo(
      () => ({
        position: "relative" as const,
        aspectRatio: "1/1",
        borderRadius: 1,
        cursor: "pointer",
        overflow: "hidden",
        ...getCardHoverStyles(showOptions),
      }),
      [showOptions]
    );

    // Render image grid based on number of thumbnails
    const renderImageGrid = () => {
      if (thumbnails.length === 1) {
        return (
          <ImageOptimizer
            src={thumbnails[0]}
            alt={name}
            aspectRatio="1:1"
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        );
      }

      // For 2-4 images, create a grid
      return (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              thumbnails.length === 2 ? "1fr 1fr" : "1fr 1fr",
            gridTemplateRows: thumbnails.length > 2 ? "1fr 1fr" : "1fr",
            width: "100%",
            height: "100%",
            gap: 0.5,
          }}
        >
          {thumbnails.map((img, index) => (
            <Box
              key={index}
              sx={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
              }}
            >
              <ImageOptimizer
                src={img}
                alt={`${name} item ${index + 1}`}
                aspectRatio="1:1"
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>
          ))}
        </Box>
      );
    };

    return (
      <Card
        sx={cardStyles}
        onClick={handleCardClick}
        onMouseEnter={() => setShowOptions(true)}
        onMouseLeave={() => setShowOptions(false)}
      >
        {renderImageGrid()}

        <Box
          sx={overlayAvatarStyles}
          className="creator-avatar"
          onClick={handleOwnerClick}
        >
          <Avatar
            variant="creator"
            src={owner.avatar}
            alt={owner.username}
            sx={{
              width: 32,
              height: 32,
            }}
          >
            {owner.username.charAt(0).toUpperCase()}
          </Avatar>
        </Box>

        <Box
          className="title-overlay"
          sx={{
            ...overlayTitleContainerStyles,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
          }}
        >
          <Typography variant="overlayTitle" fontWeight="bold" noWrap>
            {name}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="overlaySubtitle">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </Typography>
            <Typography variant="overlaySubtitle">•</Typography>
            <Typography variant="overlaySubtitle">
              by {owner.username}
            </Typography>
          </Stack>
          {description && (
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                mt: 0.5,
              }}
            >
              {description}
            </Typography>
          )}
        </Box>

        <Box
          className="list-badge"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 3,
          }}
        >
          <Chip
            label="List"
            size="small"
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              fontWeight: 600,
              fontSize: "0.7rem",
            }}
          />
        </Box>
      </Card>
    );
  }
);

ListCard.displayName = "ListCard";

export default ListCard;
