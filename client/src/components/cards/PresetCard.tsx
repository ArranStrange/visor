import React, { memo, useCallback, useMemo, useEffect } from "react";
import { Card, Typography, Chip, Box, Avatar, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import AddToListDialog from "../dialogs/AddToListDialog";
import { useMobileDetection } from "../../hooks/useMobileDetection";
import ImageOptimizer from "../media/ImageOptimizer";

const placeholderImage = "/placeholder-image.jpg";

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

const PresetCard: React.FC<PresetCardProps> = memo(
  ({ slug, title, afterImage, tags, creator, id }) => {
    const navigate = useNavigate();
    const [addToListOpen, setAddToListOpen] = React.useState(false);
    const [showOptions, setShowOptions] = React.useState(false);
    const isMobile = useMobileDetection();

    const imageUrl = useMemo(() => {
      if (!afterImage) return placeholderImage;
      if (typeof afterImage === "string") return afterImage;
      if (afterImage.url) return afterImage.url;
      return placeholderImage;
    }, [afterImage]);

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
    }, [showOptions, isMobile]);

    const cardStyles = useMemo(
      () => ({
        position: "relative" as const,
        aspectRatio: "4/5",
        borderRadius: 1,
        cursor: "pointer",
        overflow: "hidden",
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
        "@media (hover: none)": {
          "& .tags-overlay": {
            opacity: showOptions ? 1 : 0,
          },
          "& .creator-avatar": {
            opacity: showOptions ? 1 : 0,
          },
          "& .add-to-list-button": {
            opacity: showOptions ? 1 : 0,
          },
        },
      }),
      [showOptions]
    );

    return (
      <Card sx={cardStyles} onClick={handleCardClick}>
        <ImageOptimizer
          src={imageUrl}
          alt={title}
          aspectRatio="4:5"
          loading="lazy"
          style={{
            height: "100%",
            width: "100%",
            objectFit: "cover",
          }}
        />

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
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            textAlign: "center",
            transition: "background-color 0.3s ease-in-out",
            p: 2,
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              color: "rgba(255, 255, 255, 0.9)",
              textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
              transition: "color 0.8s ease-in-out",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.9)",
              textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
              transition: "color 0.8s ease-in-out",
            }}
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
      </Card>
    );
  }
);

PresetCard.displayName = "PresetCard";

export default PresetCard;
