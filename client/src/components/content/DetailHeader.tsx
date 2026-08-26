import React from "react";
import {
  Box,
  Stack,
  Typography,
  Avatar,
  Button,
  IconButton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
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

interface DetailHeaderProps {
  creator?: Creator;
  title: string;
  featured: boolean;
  isAdmin: boolean;
  /**
   * Whether to show the ⋮ menu at all. Not the same as ownership: a signed-in
   * visitor gets the menu too, because Report lives in it.
   */
  showMenu: boolean;
  onFeaturedToggle: () => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  menuButtonTestId?: string;
}

const DetailHeader: React.FC<DetailHeaderProps> = ({
  creator,
  title,
  featured,
  isAdmin,
  showMenu,
  onFeaturedToggle,
  onMenuOpen,
  menuButtonTestId,
}) => {
  const navigate = useNavigate();

  return (
    <>
      {creator && (
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
        </Box>
      )}

      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Typography variant="h4" fontWeight="bold">
          {title}
        </Typography>
        {isAdmin && (
          <IconButton
            onClick={onFeaturedToggle}
            size="small"
            sx={(theme) => ({
              backgroundColor: featured
                ? alpha(theme.palette.secondary.main, 0.1)
                : theme.palette.overlay.whiteBorder,
              "&:hover": {
                backgroundColor: featured
                  ? alpha(theme.palette.secondary.main, 0.2)
                  : theme.palette.overlay.whiteHover,
              },
            })}
          >
            {featured ? (
              <StarIcon fontSize="small" sx={{ color: "secondary.main" }} />
            ) : (
              <StarBorderIcon fontSize="small" />
            )}
          </IconButton>
        )}
        {showMenu && (
          <IconButton
            onClick={onMenuOpen}
            size="small"
            sx={{
              backgroundColor: "overlay.whiteBorder",
              "&:hover": { backgroundColor: "overlay.whiteHover" },
            }}
            data-cy={menuButtonTestId}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </>
  );
};

export default DetailHeader;
