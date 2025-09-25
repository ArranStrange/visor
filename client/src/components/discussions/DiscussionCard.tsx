import React from "react";
import {
  Box,
  Card,
  CardContent,
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
  Chat as ChatIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Discussion as DiscussionType } from "../../types/discussions";
import { User } from "../../types/discussions";
import {
  getDiscussionTypeIcon,
  getDiscussionTypeLabel,
} from "../../utils/discussionIcons";
import { formatDate } from "../../utils/dateUtils";
import { isUserFollowing } from "../../utils/discussionUtils";

interface DiscussionCardProps {
  discussion: DiscussionType;
  user: User | null;
  searchTerm: string;
  onFollow: (discussionId: string, isFollowed: boolean) => void;
}

const DiscussionCard: React.FC<DiscussionCardProps> = ({
  discussion,
  user,
  searchTerm,
  onFollow,
}) => {
  const navigate = useNavigate();

  const handleChipClick = () => {
    if (discussion.linkedTo.refId) {
      const path =
        discussion.linkedTo.type === "PRESET" &&
        discussion.linkedTo.preset?.slug
          ? `/preset/${discussion.linkedTo.preset.slug}`
          : discussion.linkedTo.type === "FILMSIM" &&
            discussion.linkedTo.filmSim?.slug
          ? `/filmsim/${discussion.linkedTo.filmSim.slug}`
          : null;
      if (path) {
        navigate(path);
      }
    }
  };

  const handleFollow = () => {
    onFollow(discussion.id, isUserFollowing(discussion, user));
  };

  const handleViewDiscussion = () => {
    navigate(`/discussions/${discussion.id}`);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography
                variant="h6"
                component="h3"
                sx={{ cursor: "pointer" }}
                onClick={handleViewDiscussion}
              >
                {discussion.title}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Avatar
                src={discussion.createdBy.avatar}
                sx={{ width: 20, height: 20 }}
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

            {discussion.linkedTo && (
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Chip
                  icon={getDiscussionTypeIcon(discussion.linkedTo.type)}
                  label={getDiscussionTypeLabel(discussion.linkedTo.type)}
                  size="small"
                  variant="outlined"
                  onClick={handleChipClick}
                  sx={{
                    cursor: discussion.linkedTo.refId ? "pointer" : "default",
                    opacity: discussion.linkedTo.refId ? 1 : 0.7,
                  }}
                />
              </Box>
            )}

            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="caption" color="text.secondary">
                  <ChatIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  {discussion.posts.length} posts
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <BookmarkIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  {discussion.followers.length} followers
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last activity {formatDate(discussion.updatedAt)}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <Tooltip
                  title={
                    isUserFollowing(discussion, user) ? "Unfollow" : "Follow"
                  }
                >
                  <IconButton
                    size="small"
                    onClick={handleFollow}
                    color={
                      isUserFollowing(discussion, user) ? "primary" : "default"
                    }
                  >
                    {isUserFollowing(discussion, user) ? (
                      <BookmarkIcon />
                    ) : (
                      <BookmarkBorderIcon />
                    )}
                  </IconButton>
                </Tooltip>

                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleViewDiscussion}
                >
                  View Discussion
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DiscussionCard;
