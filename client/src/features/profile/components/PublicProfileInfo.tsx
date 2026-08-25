import React, { useState } from "react";
import { Box, Typography, Button, Stack, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import InstagramIcon from "@mui/icons-material/Instagram";
import ShareIcon from "@mui/icons-material/Share";
import CameraChips from "@/features/profile/components/CameraChips";

export interface PublicProfileInfoProps {
  username: string;
  bio?: string;
  instagram?: string;
  cameras?: string[];
  presetCount: number;
  filmSimCount: number;
  likeCount: number;
  isOwnProfile: boolean;
  onEdit: () => void;
  onShare: () => void;
}

const PublicProfileInfo: React.FC<PublicProfileInfoProps> = ({
  username,
  bio,
  instagram,
  cameras,
  presetCount,
  filmSimCount,
  likeCount,
  isOwnProfile,
  onEdit,
  onShare,
}) => {
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  return (
    <Stack spacing={2}>
      {/* Row 1: Username & Buttons */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          gap: { xs: 1, sm: 2 },
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ textAlign: { xs: "center", sm: "left" } }}
        >
          {username && username.charAt(0).toUpperCase() + username.slice(1)}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {isOwnProfile && (
            <IconButton size="small" onClick={onEdit} aria-label="edit profile">
              <EditIcon />
            </IconButton>
          )}
          <IconButton onClick={onShare} aria-label="share profile">
            <ShareIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Row 2: Stats */}
      <Stack
        direction="row"
        spacing={{ xs: 2, md: 4 }}
        sx={{ justifyContent: { xs: "center", sm: "flex-start" } }}
      >
        <Box textAlign="center">
          <Typography variant="h6" fontWeight="bold">
            {presetCount}
          </Typography>
          <Typography color="text.secondary">Presets</Typography>
        </Box>
        <Box textAlign="center">
          <Typography variant="h6" fontWeight="bold">
            {filmSimCount}
          </Typography>
          <Typography color="text.secondary">Film Sims</Typography>
        </Box>
        <Box textAlign="center">
          <Typography variant="h6" fontWeight="bold">
            {likeCount}
          </Typography>
          <Typography color="text.secondary">Likes</Typography>
        </Box>
      </Stack>

      {/* Row 3: Bio, Social, Cameras */}
      <Stack spacing={2} sx={{ pt: 1 }}>
        {bio && (
          <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
            <Typography
              variant="body1"
              sx={(theme) => ({
                fontStyle: "italic",
                textAlign: { xs: "center", sm: "left" },
                // Apply truncation only on mobile and when not expanded
                ...(!isBioExpanded && {
                  [theme.breakpoints.down("sm")]: {
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }),
              })}
            >
              {bio}
            </Typography>
            <Button
              size="small"
              onClick={() => setIsBioExpanded(!isBioExpanded)}
              sx={{
                display: { xs: "inline-block", sm: "none" },
                p: 0,
                mt: 0.5,
                textTransform: "none",
                color: "text.secondary",
                fontWeight: "bold",
              }}
            >
              {isBioExpanded ? "Show less" : "more"}
            </Button>
          </Box>
        )}
        {instagram && (
          <Box display="flex" alignItems="center" gap={1}>
            <InstagramIcon color="action" />
            <Typography variant="body1">
              <a
                href={`https://instagram.com/${instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {instagram}
              </a>
            </Typography>
          </Box>
        )}
        {cameras && cameras.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Cameras
            </Typography>
            <CameraChips
              cameras={cameras}
              showIcon
              showTooltip
              sx={{ justifyContent: { xs: "center", sm: "flex-start" } }}
            />
          </Box>
        )}
      </Stack>
    </Stack>
  );
};

export default PublicProfileInfo;
