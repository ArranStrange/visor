import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
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
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { useAuth } from "../../context/AuthContext";
import { useAdmin } from "../../context/AdminContext";
import { Discussion as DiscussionType } from "../../types/discussions";
import { User } from "../../types/discussions";
import {
  getDiscussionTypeIcon,
  getDiscussionTypeLabel,
} from "lib/utils/discussionIcons";
import { formatDate } from "lib/utils/dateUtils";
import { isUserFollowing } from "lib/utils/discussionUtils";
import { ADMIN_DELETE_DISCUSSION } from "../../graphql/mutations/adminMutations";
import { GET_DISCUSSIONS } from "../../graphql/queries/discussions";

interface DiscussionCardProps {
  discussion: DiscussionType;
  user: User | null;
  searchTerm: string;
  onFollow: (discussionId: string, isFollowed: boolean) => void;
  onDelete?: (discussionId: string) => void;
  onEdit?: (discussionId: string) => void;
}

const DiscussionCard: React.FC<DiscussionCardProps> = ({
  discussion,
  user,
  searchTerm,
  onFollow,
  onDelete,
  onEdit,
}) => {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
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

  const handleAdminEdit = () => {
    if (onEdit) {
      onEdit(discussion.id);
    }
    handleMenuClose();
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
    <Card sx={{ mb: 2, overflow: "hidden" }}>
      <CardContent
        sx={{
          p: { xs: 1.5, sm: 2 },
          "&:last-child": { pb: { xs: 1.5, sm: 2 } },
        }}
      >
        <Box
          display="flex"
          alignItems="flex-start"
          gap={{ xs: 1.5, sm: 2 }}
          sx={{ width: "100%", minWidth: 0 }}
        >
          {linkedImage && (
            <Box
              sx={{
                width: { xs: 100, sm: 120 },
                height: { xs: 100, sm: 120 },
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
          <Box flex={1} minWidth={0} sx={{ overflow: "hidden" }}>
            <Box
              display="flex"
              alignItems="flex-start"
              justifyContent="space-between"
              gap={1}
              mb={1}
            >
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  cursor: "pointer",
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                  flex: "1 1 auto",
                  minWidth: 0,
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  lineHeight: 1.4,
                }}
                onClick={handleViewDiscussion}
              >
                {discussion.title.replace(/^discussion:?\s*/i, "")}
              </Typography>
              {isAdmin && (
                <Tooltip title="Admin options">
                  <IconButton
                    size="small"
                    onClick={handleMenuOpen}
                    sx={{ flexShrink: 0 }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {discussion.linkedTo && (
              <Box mb={1}>
                <Chip
                  icon={getDiscussionTypeIcon(discussion.linkedTo.type)}
                  label={getDiscussionTypeLabel(discussion.linkedTo.type)}
                  size="small"
                  variant="outlined"
                  onClick={handleChipClick}
                  sx={{
                    cursor: discussion.linkedTo.refId ? "pointer" : "default",
                    opacity: discussion.linkedTo.refId ? 1 : 0.7,
                    flexShrink: 0,
                  }}
                />
              </Box>
            )}

            {discussion.posts &&
              discussion.posts.length > 0 &&
              discussion.posts[0] && (
                <Box mb={1.5}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontSize: { xs: "0.875rem", sm: "0.875rem" },
                      lineHeight: 1.5,
                      fontStyle: "italic",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    &ldquo;{discussion.posts[0].content}&rdquo;
                  </Typography>
                </Box>
              )}

            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent={{ xs: "flex-start", sm: "space-between" }}
              gap={{ xs: 1.5, sm: 2 }}
            >
              <Box
                display="flex"
                alignItems="center"
                gap={{ xs: 1, sm: 2 }}
                flexWrap="wrap"
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  <ChatIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  {discussion.posts.length} posts
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  <BookmarkIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  {discussion.followers.length} followers
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    whiteSpace: { xs: "normal", sm: "nowrap" },
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  }}
                >
                  Last activity {formatDate(discussion.updatedAt)}
                </Typography>
              </Box>

              <Box
                display="flex"
                alignItems="center"
                gap={1}
                sx={{ flexShrink: 0, width: { xs: "100%", sm: "auto" } }}
              >
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
                  sx={{
                    whiteSpace: "nowrap",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 1, sm: 2 },
                    flex: { xs: 1, sm: "0 1 auto" },
                  }}
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
        <MenuItem onClick={handleAdminEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Discussion</ListItemText>
        </MenuItem>
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
