import React from "react";
import {
  Box,
  Stack,
  Typography,
  Avatar,
  Button,
  IconButton,
} from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";
import { FeaturedToggle, MenuOpen } from "lib/events/event-definitions";

interface Creator {
  id: string;
  username: string;
  avatar?: string;
  instagram?: string;
}

interface Preset {
  id?: string;
  creator?: Creator;
  title: string;
  featured: boolean;
}

interface PresetHeaderProps {
  preset: Preset;
  isAdmin?: boolean;
  isOwner?: boolean;
  onFeaturedToggle?: () => void;
  onMenuOpen?: (event: React.MouseEvent<HTMLElement>) => void;
}

const PresetHeader: React.FC<PresetHeaderProps> = ({
  preset,
  isAdmin = false,
  isOwner = false,
  onFeaturedToggle,
  onMenuOpen,
}) => {
  const navigate = useNavigate();
  const { creator, title, featured } = preset;

  const handleFeaturedToggle = () => {
    // Raise event for featured toggle
    FeaturedToggle.raise({
      itemId: preset.id || "",
      itemType: "preset",
      featured: !featured,
    });
    // Also call prop callback for backward compatibility
    if (onFeaturedToggle) onFeaturedToggle();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    // Raise event for menu open
    MenuOpen.raise({
      anchorEl: event.currentTarget,
      menuId: "preset-menu",
    });
    // Also call prop callback for backward compatibility
    if (onMenuOpen) onMenuOpen(event);
  };

  return (
    <Box mb={2}>
      {creator && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar
            src={creator.avatar}
            alt={creator.username}
            sx={{ cursor: "pointer" }}
            onClick={() => navigate(`/profile/${creator.id}`)}
          />
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate(`/profile/${creator.id}`)}
          >
            {creator.username}
          </Typography>
          {creator.instagram && (
            <Button
              href={`https://instagram.com/${creator.instagram}`}
              target="_blank"
              size="small"
              variant="text"
              sx={{ ml: 1, minWidth: 0, padding: 0.5 }}
            >
              <InstagramIcon fontSize="small" />
            </Button>
          )}
        </Stack>
      )}

      <Box display="flex" alignItems="center" gap={2} mb={1} mt={2}>
        <Typography variant="h4" fontWeight="bold">
          {title}
        </Typography>
        {isAdmin && (
          <IconButton
            onClick={handleFeaturedToggle}
            size="small"
            sx={{
              backgroundColor: featured
                ? "rgba(255, 165, 38, 0.1)"
                : "rgba(255, 255, 255, 0.1)",
              "&:hover": {
                backgroundColor: featured
                  ? "rgba(255, 165, 38, 0.2)"
                  : "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            {featured ? (
              <StarIcon fontSize="small" sx={{ color: "#ffa726" }} />
            ) : (
              <StarBorderIcon fontSize="small" />
            )}
          </IconButton>
        )}
        {isOwner && (
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default PresetHeader;
