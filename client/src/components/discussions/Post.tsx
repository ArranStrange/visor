import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  IconButton,
  Chip,
  Collapse,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Link,
} from "@mui/material";
import {
  Reply as ReplyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ThumbUp as LikeIcon,
  Favorite as HeartIcon,
  Psychology as ThinkingIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as ReportIcon,
  Block as BlockIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  PushPin as PinIcon,
  CheckCircle as CheckCircleIcon,
  Verified as VerifiedIcon,
  CameraAlt as CameraIcon,
  Palette as PresetIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { DiscussionPost as PostType, Reaction } from "../../types/discussions";
import PostComposer from "./PostComposer";

interface PostProps {
  post: PostType;
  depth?: number;
  onReply: (postId: string, content: string, images?: File[]) => void;
  onEdit: (postId: string, content: string) => void;
  onDelete: (postId: string) => void;
  onReact: (postId: string, reactionType: string) => void;
  onPin: (postId: string) => void;
  onHighlight: (postId: string) => void;
  onReport: (postId: string, reason: string) => void;
  onBlock: (userId: string) => void;
  maxDepth?: number;
  hasReplies?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: (postId: string) => void;
}

interface ReactionButtonProps {
  type: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

const ReactionButton: React.FC<ReactionButtonProps> = ({
  type,
  count,
  isActive,
  onClick,
}) => {
  const getIcon = () => {
    switch (type) {
      case "like":
        return <LikeIcon fontSize="small" />;
      case "heart":
        return <HeartIcon fontSize="small" />;
      case "thinking":
        return <ThinkingIcon fontSize="small" />;
      default:
        return <LikeIcon fontSize="small" />;
    }
  };

  const getColor = () => {
    if (!isActive) return "default";
    switch (type) {
      case "like":
        return "primary";
      case "heart":
        return "error";
      case "thinking":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Tooltip title={`${type.charAt(0).toUpperCase() + type.slice(1)}`}>
      <IconButton
        size="small"
        color={getColor()}
        onClick={onClick}
        sx={{
          minWidth: "auto",
          px: 1,
          py: 0.5,
          borderRadius: 2,
          backgroundColor: isActive ? "action.selected" : "transparent",
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        {getIcon()}
        {count > 0 && (
          <Typography variant="caption" sx={{ ml: 0.5 }}>
            {count}
          </Typography>
        )}
      </IconButton>
    </Tooltip>
  );
};

const Post: React.FC<PostProps> = ({
  post,
  depth = 0,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onPin,
  onHighlight,
  onReport,
  onBlock,
  maxDepth = 3,
  hasReplies = false,
  isCollapsed = true,
  onToggleCollapse,
}) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState(post.content);
  const [isExpanded, setIsExpanded] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleReply = () => {
    if (!replyContent.trim()) return;
    onReply(post.id, replyContent);
    setReplyContent("");
    setIsReplying(false);
  };

  const handleEdit = () => {
    if (!editContent.trim()) return;
    onEdit(post.id, editContent);
    setIsEditing(false);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(post.id);
    handleMenuClose();
  };

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

  const renderContent = (content: string) => {
    // Simple mention detection - in a real app, you'd use a proper parser
    const mentionRegex = /@(\w+)/g;
    const parts = content.split(mentionRegex);

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a mention
        return (
          <Link
            key={index}
            href={`/profile/${part}`}
            sx={{ color: "primary.main", textDecoration: "none" }}
          >
            @{part}
          </Link>
        );
      }
      return part;
    });
  };

  const isAuthor = user?.id === post.author.id;
  const isHighlighted = false;

  return (
    <Box
      sx={{
        ml: depth * 3,
        mb: 2,
        position: "relative",
        "&::before":
          depth > 0
            ? {
                content: '""',
                position: "absolute",
                left: -12,
                top: 0,
                bottom: 0,
                width: 2,
                backgroundColor: "divider",
                zIndex: 0,
              }
            : {},
      }}
    >
      <Card
        sx={{
          position: "relative",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <CardContent sx={{ pt: 2 }}>
          {/* Post Header */}
          <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
            <Box position="relative">
              <Avatar src={post.author.avatar} sx={{ width: 40, height: 40 }}>
                {post.author.username.charAt(0).toUpperCase()}
              </Avatar>
            </Box>

            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {post.author.username}
                </Typography>

                {post.parentId && (
                  <Typography variant="caption" color="text.secondary">
                    replying to a post
                  </Typography>
                )}

                <Typography variant="caption" color="text.secondary">
                  {formatDate(post.createdAt)}
                </Typography>

                {post.isEdited && (
                  <Typography variant="caption" color="text.secondary">
                    (edited)
                  </Typography>
                )}
              </Box>

              {/* Post content */}
              {!isEditing ? (
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {renderContent(post.content)}
                </Typography>
              ) : (
                <Box>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    style={{
                      width: "100%",
                      minHeight: "80px",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontFamily: "inherit",
                      fontSize: "14px",
                      resize: "vertical",
                    }}
                  />
                  <Box display="flex" gap={1} mt={1}>
                    <button
                      onClick={handleEdit}
                      disabled={!editContent.trim()}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#1976d2",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(post.content);
                      }}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#666",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </Box>
                </Box>
              )}

              {/* Images */}
              {post.imageUrl && (
                <Box mt={2}>
                  <img
                    src={post.imageUrl}
                    alt="Post image"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "400px",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  />
                </Box>
              )}

              {/* Mentions */}
              {post.mentions && post.mentions.length > 0 && (
                <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
                  {post.mentions.map((mention, index) => (
                    <Chip
                      key={index}
                      label={`@${mention.displayName}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: "0.7rem" }}
                    />
                  ))}
                </Box>
              )}

              {/* Reactions */}
              {post.reactions && post.reactions.length > 0 && (
                <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
                  {post.reactions.map((reaction) => (
                    <ReactionButton
                      key={reaction.emoji}
                      type={reaction.emoji}
                      count={reaction.count}
                      isActive={reaction.users.some((u) => u.id === user?.id)}
                      onClick={() => onReact(post.id, reaction.emoji)}
                    />
                  ))}
                </Box>
              )}

              {/* Action buttons */}
              <Box display="flex" alignItems="center" gap={1} mt={2}>
                <Tooltip title="Reply">
                  <IconButton
                    size="small"
                    onClick={() => setIsReplying(!isReplying)}
                  >
                    <ReplyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {/* Add reaction button */}
                <Tooltip title="Add reaction">
                  <IconButton
                    size="small"
                    onClick={() => onReact(post.id, "👍")}
                  >
                    <LikeIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {/* More options */}
                {(isAuthor || user) && (
                  <Tooltip title="More options">
                    <IconButton size="small" onClick={handleMenuOpen}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              {/* Reply composer */}
              {isReplying && (
                <Box mt={2}>
                  <PostComposer
                    onSubmit={(content) => {
                      onReply(post.id, content);
                      setIsReplying(false);
                    }}
                    placeholder="Write a reply..."
                    buttonText="Reply"
                    showMentions={false}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>

        {/* Collapse/Expand button - positioned at bottom right */}
        {hasReplies && onToggleCollapse && (
          <Box
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              zIndex: 1,
            }}
          >
            <Tooltip title={isCollapsed ? "Show replies" : "Hide replies"}>
              <IconButton
                size="small"
                onClick={() => onToggleCollapse(post.id)}
                sx={{
                  backgroundColor: "background.paper",
                  border: "2px solid",
                  borderColor: "primary.main",
                  color: "primary.main",
                  width: 28,
                  height: 28,
                  boxShadow: 2,
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                    transform: "scale(1.1)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                {isCollapsed ? (
                  <ExpandMoreIcon fontSize="small" />
                ) : (
                  <ExpandLessIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Card>

      {/* More options menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {isAuthor && (
          <>
            <MenuItem
              onClick={() => {
                setIsEditing(true);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleDelete}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </>
        )}
        {user && !isAuthor && (
          <>
            <MenuItem
              onClick={() => {
                onReport(post.id, "spam");
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <ReportIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Report</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                onBlock(post.author.id);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <BlockIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Block user</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default Post;
