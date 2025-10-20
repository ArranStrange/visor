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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Chat as ChatIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { Discussion as DiscussionType } from "../../types/discussions";
import { User } from "../../types/discussions";
import {
  getDiscussionTypeIcon,
  getDiscussionTypeLabel,
} from "../../utils/discussionIcons";
import { formatDate } from "../../utils/dateUtils";
import { isUserFollowing } from "../../utils/discussionUtils";
import { ADMIN_DELETE_DISCUSSION } from "../../graphql/mutations/adminMutations";
import { GET_DISCUSSIONS } from "../../graphql/queries/discussions";

interface DiscussionCardProps {
  discussion: DiscussionType;
  user: User | null;
  searchTerm: string;
  onFollow: (discussionId: string, isFollowed: boolean) => void;
  onDelete?: (discussionId: string) => void;
}

const DiscussionCard: React.FC<DiscussionCardProps> = ({
  discussion,
  user,
  searchTerm,
  onFollow,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [adminDeleteDiscussion] = useMutation(ADMIN_DELETE_DISCUSSION, {
    refetchQueries: [GET_DISCUSSIONS],
  });

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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAdminDelete = async () => {
    try {
      await adminDeleteDiscussion({
        variables: { id: discussion.id },
      });
      if (onDelete) {
        onDelete(discussion.id);
      }
      handleMenuClose();
    } catch (error) {
      console.error("Error deleting discussion:", error);
    }
  };

  // Get image URL from linked preset or filmSim
  const getLinkedImage = () => {
    if (
      discussion.linkedTo.type === "PRESET" &&
      discussion.linkedTo.preset?.afterImage?.url
    ) {
      return discussion.linkedTo.preset.afterImage.url;
    }
    if (
      discussion.linkedTo.type === "FILMSIM" &&
      discussion.linkedTo.filmSim?.sampleImages?.[0]?.url
    ) {
      return discussion.linkedTo.filmSim.sampleImages[0].url;
    }
    return null;
  };

  const linkedImage = getLinkedImage();

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
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
              onClick={handleChipClick}
            >
              <img
                src={linkedImage}
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
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography
                variant="h6"
                component="h3"
                sx={{ cursor: "pointer" }}
                onClick={handleViewDiscussion}
              >
                {discussion.title}
              </Typography>
              {user?.isAdmin && !discussion.linkedTo.refId && (
                <Tooltip title="Admin options">
                  <IconButton size="small" onClick={handleMenuOpen}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
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

      {/* Admin Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleAdminDelete} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Discussion</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default DiscussionCard;
