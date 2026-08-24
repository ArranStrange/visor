import React from "react";
import {
  Box,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Avatar,
  Typography,
  Chip,
} from "@mui/material";
import {
  NavigateNext as NavigateNextIcon,
  CameraAlt as CameraIcon,
  Palette as PresetIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { Discussion } from "../../types/discussions";
import {
  getResponsiveImageSrcSet,
  optimizeImageUrl,
} from "../../utils/cloudinary";

interface DiscussionHeaderProps {
  discussion: Discussion;
  linkedImage: string | null;
  onBackToDiscussions: (e: React.MouseEvent) => void;
  onNavigateToLinkedItem: () => void;
}

const DiscussionHeader: React.FC<DiscussionHeaderProps> = ({
  discussion,
  linkedImage,
  onBackToDiscussions,
  onNavigateToLinkedItem,
}) => {
  return (
    <>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 2 }}
      >
        <Link color="inherit" href="/discussions" onClick={onBackToDiscussions}>
          Discussions
        </Link>
        <Typography color="text.primary">{discussion.title}</Typography>
      </Breadcrumbs>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ pb: 2, "&:last-child": { pb: 2 } }}>
          <Box display="flex" alignItems="flex-start" gap={2}>
            {linkedImage && (
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: 2,
                  overflow: "hidden",
                  flexShrink: 0,
                  cursor: "pointer",
                }}
                onClick={onNavigateToLinkedItem}
              >
                <img
                  src={optimizeImageUrl(linkedImage, 480)}
                  srcSet={getResponsiveImageSrcSet(linkedImage, [240, 480])}
                  sizes="120px"
                  loading="lazy"
                  alt={
                    discussion.linkedTo.preset?.title ||
                    discussion.linkedTo.filmSim?.name ||
                    ""
                  }
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
            )}
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                <Avatar
                  src={discussion.createdBy.avatar}
                  sx={{ width: 32, height: 32 }}
                >
                  {discussion.createdBy.username.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="body2">
                  {discussion.createdBy.username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(discussion.createdAt)}
                </Typography>
              </Box>

              <Typography variant="h5" component="h1" mb={0.5}>
                {discussion.title}
              </Typography>

              {discussion.linkedTo && (
                <Box display="flex" gap={1} mb={1}>
                  <Chip
                    icon={
                      discussion.linkedTo.type === "PRESET" ? (
                        <PresetIcon />
                      ) : (
                        <CameraIcon />
                      )
                    }
                    label={
                      discussion.linkedTo.preset?.title ||
                      discussion.linkedTo.filmSim?.name
                    }
                    size="small"
                    variant="outlined"
                    onClick={onNavigateToLinkedItem}
                    sx={{ cursor: "pointer" }}
                  />
                </Box>
              )}

              <Box display="flex" gap={2} mt={0.5}>
                <Typography variant="caption" color="text.secondary">
                  {discussion.posts.length} posts
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {discussion.followers.length} followers
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last activity {formatDate(discussion.updatedAt)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
};

function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return "a moment ago";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "an unknown time ago";
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "an unknown time ago";
  }
}

export default DiscussionHeader;
