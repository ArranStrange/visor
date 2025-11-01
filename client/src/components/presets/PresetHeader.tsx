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

interface Creator {
  id: string;
  username: string;
  avatar?: string;
  instagram?: string;
}

interface PresetHeaderProps {
  creator: Creator;
  title: string;
  featured: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  onFeaturedToggle: () => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
}

const PresetHeader: React.FC<PresetHeaderProps> = ({
  creator,
  title,
  featured,
  isAdmin,
  isOwner,
  onFeaturedToggle,
  onMenuOpen,
}) => {
  const navigate = useNavigate();

  return (
    <Box mb={2}>
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

      <Box display="flex" alignItems="center" gap={2} mb={1} mt={2}>
        <Typography variant="h4" fontWeight="bold">
          {title}
        </Typography>
        {isAdmin && (
          <IconButton
            onClick={onFeaturedToggle}
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
            onClick={onMenuOpen}
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
