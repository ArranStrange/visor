import React, { memo, useCallback } from "react";
import { optimizeImageUrl } from "@/utils/cloudinary";
import {
  Typography,
  Box,
  Chip,
  Stack,
  Avatar,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import AddToListDialog from "@/features/lists/components/AddToListDialog";
import ImageOptimizer from "@/components/media/ImageOptimizer";
import CardShell from "@/components/cards/CardShell";
import CompatibilityChip from "@/features/compatibility/components/CompatibilityChip";
import type { RecipeCompatibilitySettings } from "@/features/compatibility";
import {
  overlayButtonStyles,
  overlayAvatarStyles,
  overlayTitleContainerStyles,
  overlayTagsContainerStyles,
} from "@/theme/cardOverlays";

const filmSimCardStyles = {
  transition: "transform 0.2s ease-in-out, boxShadow 0.2s ease-in-out",
};

interface FilmSimCardProps {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  featured?: boolean;
  tags?: Array<{
    id?: string;
    displayName: string;
  }>;
  creator?: {
    username: string;
    avatar?: string;
    id?: string;
  };
  /** Sensor generations the recipe declares, for the compatibility verdict. */
  compatibleSensors?: string[] | null;
  /** Recipe settings the compatibility verdict reads. */
  settings?: RecipeCompatibilitySettings | null;
}

const FilmSimCard: React.FC<FilmSimCardProps> = memo(
  ({
    id,
    name,
    slug,
    thumbnail,
    tags = [],
    creator,
    compatibleSensors,
    settings,
  }) => {
    const navigate = useNavigate();
    const [addToListOpen, setAddToListOpen] = React.useState(false);

    const handleAddToList = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setAddToListOpen(true);
    }, []);

    const handleCloseDialog = useCallback(() => {
      setAddToListOpen(false);
    }, []);

    return (
      <CardShell
        aspectRatio="2/3"
        navigateTo={`/filmsim/${slug}`}
        navigationBlocked={addToListOpen}
        cardSx={filmSimCardStyles}
        renderMedia={renderMedia}
      >
        <Box className="add-to-list-button" sx={overlayButtonStyles}>
          <IconButton
            variant="floating"
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
              src={optimizeImageUrl(creator.avatar, 100)}
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
            backgroundColor: "overlay.scrimSubtle",
          }}
        >
          <Typography variant="overlayTitle" fontWeight="bold">
            {name}
          </Typography>
          <Typography variant="overlaySubtitle">Film Sim</Typography>
        </Box>

        <Box
          className="compatibility-chip"
          sx={{ position: "absolute", top: 8, left: 8, zIndex: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          <CompatibilityChip
            settings={settings}
            compatibleSensors={compatibleSensors}
          />
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
      </CardShell>
    );

    function renderMedia() {
      return (
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
      );
    }
  }
);

FilmSimCard.displayName = "FilmSimCard";

export default FilmSimCard;
