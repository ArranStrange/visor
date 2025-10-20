import React, { memo, useCallback, useMemo, useEffect } from "react";
import {
  Card,
  Typography,
  Chip,
  Box,
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import AddToListDialog from "../dialogs/AddToListDialog";
import { useMobileDetection } from "../../hooks/useMobileDetection";
import { useFeatured } from "../../hooks/useFeatured";
import ImageOptimizer from "../media/ImageOptimizer";
import {
  overlayButtonStyles,
  overlayAvatarStyles,
  overlayTitleContainerStyles,
  overlayTagsContainerStyles,
  getCardHoverStyles,
} from "../../styles/cardOverlays";

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
  featured?: boolean;
}

const PresetCard: React.FC<PresetCardProps> = memo(
  ({ slug, title, afterImage, tags, creator, id, featured = false }) => {
    const navigate = useNavigate();
    const [addToListOpen, setAddToListOpen] = React.useState(false);
    const [showOptions, setShowOptions] = React.useState(false);
    const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
      null
    );
    const isMobile = useMobileDetection();
    const { isAdmin, togglePresetFeatured } = useFeatured();

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

    const handleMenuOpen = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setMenuAnchorEl(event.currentTarget);
      },
      []
    );

    const handleMenuClose = useCallback(() => {
      setMenuAnchorEl(null);
    }, []);

    const handleEdit = useCallback(() => {
      handleMenuClose();
      // TODO: Implement edit functionality
      console.log("Edit preset:", id);
    }, [handleMenuClose, id]);

    const handleDelete = useCallback(() => {
      handleMenuClose();
      // TODO: Implement delete functionality
      console.log("Delete preset:", id);
    }, [handleMenuClose, id]);

    const handleToggleFeatured = useCallback(async () => {
      handleMenuClose();
      try {
        await togglePresetFeatured(id!, featured);
      } catch (error) {
        console.error("Error toggling featured status:", error);
      }
    }, [handleMenuClose, togglePresetFeatured, id, featured]);

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
        ...getCardHoverStyles(showOptions),
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

        {isAdmin && id && (
          <Box
            className="options-button"
            sx={{
              ...overlayButtonStyles,
              top: "8px",
              right: "8px",
            }}
          >
            <IconButton
              className="floating"
              onClick={handleMenuOpen}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                "&:hover": {
                  color: "white",
                },
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

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

        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
          PaperProps={{
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              color: "white",
              "& .MuiMenuItem-root": {
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              },
            },
          }}
        >
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon sx={{ color: "white" }} />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleToggleFeatured}>
            <ListItemIcon>
              {featured ? (
                <StarIcon sx={{ color: "#FFD700" }} />
              ) : (
                <StarBorderIcon sx={{ color: "white" }} />
              )}
            </ListItemIcon>
            <ListItemText>
              {featured ? "Remove from featured" : "Make featured"}
            </ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon sx={{ color: "#ff4444" }} />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </Card>
    );
  }
);

PresetCard.displayName = "PresetCard";

export default PresetCard;
