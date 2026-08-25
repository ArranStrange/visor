import React, { memo, useCallback, useMemo } from "react";
import {
  getResponsiveImageSrcSet,
  optimizeImageUrl,
} from "../../utils/cloudinary";
import { Typography, Chip, Box, Avatar, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import AddToListDialog from "../dialogs/AddToListDialog";
import AnimatedBeforeAfterSlider from "../media/AnimatedBeforeAfterSlider";
import CardShell, { CardShellRenderState } from "./CardShell";
import {
  overlayButtonStyles,
  overlayAvatarStyles,
  overlayTitleContainerStyles,
  overlayTagsContainerStyles,
} from "../../theme/cardOverlays";

const placeholderImage = "/placeholder-image.jpg";

interface PresetImage {
  url?: string | null;
}

interface PresetCardProps {
  slug: string;
  title: string;
  afterImage?: string | PresetImage | null;
  beforeImage?: string | PresetImage | null;
  tags: { displayName: string }[];
  creator?: {
    username: string;
    avatar?: string;
    id?: string;
  };
  id?: string;
  featured?: boolean;
}

const PresetCard: React.FC<PresetCardProps> = memo(
  ({ slug, title, afterImage, beforeImage, tags, creator, id }) => {
    const navigate = useNavigate();
    const [addToListOpen, setAddToListOpen] = React.useState(false);

    const afterImageUrl = useMemo(() => {
      if (!afterImage) return placeholderImage;
      if (typeof afterImage === "string") return afterImage;
      if (afterImage.url) return afterImage.url;
      return placeholderImage;
    }, [afterImage]);

    const beforeImageUrl = useMemo(() => {
      if (!beforeImage) return null;
      if (typeof beforeImage === "string") return beforeImage;
      // Check multiple possible structures
      if (beforeImage.url) return beforeImage.url;
      // Check if it's an object with nested url (GraphQL structure)
      if (typeof beforeImage === "object" && "url" in beforeImage) {
        return beforeImage.url || null;
      }
      console.warn(
        "PresetCard: beforeImage has unexpected structure:",
        beforeImage
      );
      return null;
    }, [beforeImage]);

    const optimizedAfterImageUrl =
      optimizeImageUrl(afterImageUrl, 800) || afterImageUrl;
    const optimizedBeforeImageUrl = optimizeImageUrl(beforeImageUrl, 800);
    const afterImageSrcSet = getResponsiveImageSrcSet(
      afterImageUrl,
      [300, 600, 800]
    );
    const beforeImageSrcSet = getResponsiveImageSrcSet(
      beforeImageUrl,
      [300, 600, 800]
    );

    const handleAddToList = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setAddToListOpen(true);
    }, []);

    const handleCloseDialog = useCallback(() => {
      setAddToListOpen(false);
    }, []);

    return (
      <CardShell
        aspectRatio="4/5"
        navigateTo={`/preset/${slug}`}
        navigationBlocked={addToListOpen}
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
          className="title-overlay"
          sx={{
            ...overlayTitleContainerStyles,
            backgroundColor: "overlay.scrimSubtle",
          }}
        >
          <Typography variant="overlayTitle" fontWeight="bold">
            {title}
          </Typography>
          <Typography variant="overlaySubtitle">Lightroom Preset</Typography>
        </Box>

        <Box className="tags-overlay" sx={overlayTagsContainerStyles}>
          {(tags || [])
            .slice(0, 3)
            .reverse()
            .map((tag, index) => (
              <Chip
                key={index}
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
        </Box>

        <AddToListDialog
          open={addToListOpen}
          onClose={handleCloseDialog}
          presetId={id}
          itemName={title}
        />
      </CardShell>
    );

    function renderMedia({ isMobile, isHovered }: CardShellRenderState) {
      return (
        <AnimatedBeforeAfterSlider
          beforeImage={optimizedBeforeImageUrl}
          afterImage={optimizedAfterImageUrl}
          beforeImageSrcSet={beforeImageSrcSet}
          afterImageSrcSet={afterImageSrcSet}
          sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 25vw"
          loading="lazy"
          isMobile={isMobile}
          isHovered={isHovered}
        />
      );
    }
  }
);

PresetCard.displayName = "PresetCard";

export default PresetCard;
