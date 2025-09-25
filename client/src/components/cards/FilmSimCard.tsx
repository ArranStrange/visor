import React, { useEffect, memo, useCallback, useMemo } from "react";
import {
  Card,
  Typography,
  Box,
  Chip,
  Stack,
  Avatar,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import AddToListDialog from "../dialogs/AddToListDialog";
import { useMobileDetection } from "../../hooks/useMobileDetection";
import ImageOptimizer from "../media/ImageOptimizer";
import {
  overlayButtonStyles,
  overlayAvatarStyles,
  overlayTitleContainerStyles,
  overlayTagsContainerStyles,
  getCardHoverStyles,
} from "../../styles/cardOverlays";

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
    avatar?: string;
    id?: string;
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

const FilmSimCard: React.FC<FilmSimCardProps> = memo(
  ({ id, name, slug, thumbnail, tags = [], creator }) => {
    const navigate = useNavigate();
    const [addToListOpen, setAddToListOpen] = React.useState(false);
    const [showOptions, setShowOptions] = React.useState(false);
    const isMobile = useMobileDetection();

    // Memoize event handlers
    const handleClick = useCallback(() => {
      if (!addToListOpen) {
        if (isMobile) {
          if (!showOptions) {
            setShowOptions(true);
          } else {
            navigate(`/filmsim/${slug}`);
          }
        } else {
          navigate(`/filmsim/${slug}`);
        }
      }
    }, [addToListOpen, isMobile, showOptions, navigate, slug]);

    const handleAddToList = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setAddToListOpen(true);
    }, []);

    const handleCloseDialog = useCallback(() => {
      setAddToListOpen(false);
    }, []);

    useEffect(() => {
      if (!isMobile && showOptions) {
        const timer = setTimeout(() => {
          setShowOptions(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }, [showOptions, isMobile]);

    // Memoize card styles
    const cardStyles = useMemo(
      () => ({
        position: "relative" as const,
        aspectRatio: "2/3",
        borderRadius: 1,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.2s ease-in-out, boxShadow 0.2s ease-in-out",
        ...getCardHoverStyles(showOptions),
      }),
      [showOptions]
    );

    return (
      <Card sx={cardStyles} onClick={handleClick}>
        <ImageOptimizer
          src={thumbnail || "/placeholder-image.jpg"}
          alt={name}
          aspectRatio="2:3"
          loading="lazy"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        <Box className="add-to-list-button" sx={overlayButtonStyles}>
          <IconButton
            className="floating"
            onClick={handleAddToList}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>

        {creator && (
          <Box
            sx={overlayAvatarStyles}
            className="creator-avatar"
            onClick={(e) => {
              e.stopPropagation();
              if (creator.id) {
                navigate(`/profile/${creator.id}`);
              }
            }}
          >
            <Avatar
              variant="creator"
              src={creator.avatar}
              alt={creator.username}
              sx={{
                width: 32,
                height: 32,
              }}
            >
              {creator.username.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        )}

        <Box
          className="title-container"
          sx={{
            ...overlayTitleContainerStyles,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          }}
        >
          <Typography variant="overlayTitle" fontWeight="bold">
            {name}
          </Typography>
          <Typography variant="overlaySubtitle">Film Sim</Typography>
        </Box>

        <Box
          className="tags-container"
          sx={{
            ...overlayTagsContainerStyles,
            p: 2,
          }}
        >
          <Stack
            direction="row"
            gap={1}
            flexWrap="wrap"
            justifyContent="flex-start"
          >
            {(tags ?? [])
              .slice(0, 3)
              .reverse()
              .map((tag, index) => (
                <Chip
                  key={`${id}-tag-${index}-${tag.id ?? tag.displayName}`}
                  variant="overlay"
                  label={tag.displayName}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      `/search?tag=${encodeURIComponent(tag.displayName)}`
                    );
                  }}
                />
              ))}
          </Stack>
        </Box>

        <AddToListDialog
          open={addToListOpen}
          onClose={handleCloseDialog}
          filmSimId={id}
          itemName={name}
        />
      </Card>
    );
  }
);

FilmSimCard.displayName = "FilmSimCard";

export default FilmSimCard;
