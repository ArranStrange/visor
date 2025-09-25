import React from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  CameraAlt as CameraIcon,
  Palette as PresetIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Discussion as DiscussionType } from "../../types/discussions";

interface DiscussionHeaderProps {
  discussion: DiscussionType;
  isUserFollowing: boolean;
  onFollow: () => void;
  isEmbedded?: boolean;
  minimalHeader?: boolean;
}

const DiscussionHeader: React.FC<DiscussionHeaderProps> = ({
  discussion,
  isUserFollowing,
  onFollow,
  isEmbedded = true,
  minimalHeader = false,
}) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "a moment ago";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "an unknown time ago";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return "an unknown time ago";
    }
  };

  if (minimalHeader) {
    return (
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6" gutterBottom>
          Discussions
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title={isUserFollowing ? "Unfollow" : "Follow"}>
            <IconButton
              size="small"
              onClick={onFollow}
              color={isUserFollowing ? "primary" : "default"}
            >
              {isUserFollowing ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
          </Tooltip>

          {isEmbedded && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate(`/discussions/${discussion.id}`)}
            >
              View Full Thread
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box display="flex" alignItems="flex-start" gap={2}>
      <Avatar
        src={discussion.createdBy.avatar}
        sx={{ width: 50, height: 50, mt: 0.5 }}
      >
        {discussion.createdBy.username.charAt(0).toUpperCase()}
      </Avatar>
      <Box flex={1}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Typography variant="h4" component="h1" sx={{ flex: 1 }}>
            {discussion.title}
          </Typography>

          <Tooltip title={isUserFollowing ? "Unfollow" : "Follow"}>
            <IconButton
              size="small"
              onClick={onFollow}
              color={isUserFollowing ? "primary" : "default"}
            >
              {isUserFollowing ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
          </Tooltip>

          {isEmbedded && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate(`/discussions/${discussion.id}`)}
            >
              View Full Thread
            </Button>
          )}
        </Box>

        {discussion.linkedTo && (
          <Box display="flex" gap={1} mb={2}>
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
              onClick={() => {
                const path =
                  discussion.linkedTo.type === "PRESET"
                    ? `/preset/${discussion.linkedTo.preset?.slug}`
                    : `/filmsim/${discussion.linkedTo.filmSim?.slug}`;
                navigate(path);
              }}
              sx={{ cursor: "pointer" }}
            />
          </Box>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            by {discussion.createdBy.username}
            {" • "}
            {formatDate(discussion.createdAt)}
          </Typography>
          <Box display="flex" gap={1}>
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
    </Box>
  );
};

export default DiscussionHeader;
