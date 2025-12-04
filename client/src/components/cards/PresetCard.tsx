import React, { memo, useCallback, useMemo, useEffect } from "react";
import { Card, Typography, Chip, Box, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddToListDialog from "../dialogs/AddToListDialog";
import { useMobileDetection } from "../../hooks/useMobileDetection";
import AnimatedBeforeAfterSlider from "../media/AnimatedBeforeAfterSlider";
import {
  overlayAvatarStyles,
  overlayTitleContainerStyles,
  overlayTagsContainerStyles,
  getCardHoverStyles,
} from "../../styles/cardOverlays";
import {
  PresetCardOverlay,
  PresetCardFooter,
} from "../../lib/slots/slot-definitions";

const placeholderImage = "/placeholder-image.jpg";

interface PresetCardProps {
  slug: string;
  title: string;
  afterImage?: any;
  beforeImage?: any;
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
    const [showOptions, setShowOptions] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    const isMobile = useMobileDetection();

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

    const handleAddToList = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setAddToListOpen(true);
    }, []);

    const handleCloseDialog = useCallback(() => {
      setAddToListOpen(false);
    }, []);

    const handleCardClick = useCallback(() => {
      if (!addToListOpen) {
        if (isMobile) {
          if (!showOptions) {
            setShowOptions(true);
            setIsHovered(true);
          } else {
            navigate(`/preset/${slug}`);
          }
        } else {
          navigate(`/preset/${slug}`);
        }
      }
    }, [addToListOpen, isMobile, showOptions, navigate, slug]);

    useEffect(() => {
      if (!isMobile && showOptions) {
        const timer = setTimeout(() => {
          setShowOptions(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
      if (isMobile && !showOptions) {
        setIsHovered(false);
      }
    }, [showOptions, isMobile]);

    useEffect(() => {
      if (showOptions) {
        setIsHovered(true);
      }
    }, [showOptions]);

    const cardStyles = useMemo(
      () => ({
        position: "relative" as const,
        aspectRatio: "4/5",
        borderRadius: 1,
        cursor: "pointer",
        overflow: "hidden",
        ...getCardHoverStyles(showOptions),
      }),
      [showOptions]
    );

    return (
      <Card
        sx={cardStyles}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatedBeforeAfterSlider
          beforeImage={beforeImageUrl || undefined}
          afterImage={afterImageUrl}
          isMobile={isMobile}
          isHovered={isHovered}
        />

        {/* Card overlay actions - plugins can inject buttons here */}
        <PresetCardOverlay.Slot
          id={id || ""}
          name={title}
          onAddToList={handleAddToList}
        />

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
          className="title-overlay"
          sx={{
            ...overlayTitleContainerStyles,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
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
                    `/explore?tag=${encodeURIComponent(tag.displayName)}`
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
      </Card>
    );
  }
);

PresetCard.displayName = "PresetCard";

export default PresetCard;
