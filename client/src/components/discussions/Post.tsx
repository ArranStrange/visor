import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CircularProgress,
  Button,
  TextField,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { DiscussionPost as PostType } from "../../types/discussions";
import Reply from "./Reply";

interface PostProps {
  post: PostType;
  postIndex: number;
  onEdit: (postIndex: number, content: string) => void;
  onDelete: (postIndex: number) => void;
  onReply?: (postIndex: number, content: string) => void;
  onEditReply?: (
    postIndex: number,
    replyIndex: number,
    content: string
  ) => void;
  onDeleteReply?: (postIndex: number, replyIndex: number) => void;
  isDeleting?: boolean;
}

const Post: React.FC<PostProps> = ({
  post,
  postIndex,
  onEdit,
  onDelete,
  onReply,
  onEditReply,
  onDeleteReply,
  isDeleting,
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [replyContent, setReplyContent] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    if (!editContent.trim()) return;
    onEdit(postIndex, editContent);
    setIsEditing(false);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(postIndex);
    handleMenuClose();
  };

  const handleReply = () => {
    if (!replyContent.trim() || !onReply) return;
    onReply(postIndex, replyContent);
    setReplyContent("");
    setIsReplying(false);
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

  const isAuthor = user?.id === post.userId;
  const isLoggedIn = !!user;

  return (
    <Box sx={{ mb: 1.5 }}>
      <Card
        sx={{
          position: "relative",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
          {/* Post Header */}
          <Box display="flex" alignItems="flex-start" gap={2} mb={0.5}>
            <Avatar src={post.avatar} sx={{ width: 32, height: 32 }}>
              {post.username.charAt(0).toUpperCase()}
            </Avatar>

            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {post.username}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {formatDate(post.timestamp)}
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
                  {post.content}
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

              {/* Action buttons */}
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                {/* Reply button */}
                {isLoggedIn && onReply && (
                  <Button
                    size="small"
                    startIcon={<ReplyIcon sx={{ fontSize: 14 }} />}
                    onClick={() => setIsReplying(!isReplying)}
                    sx={{ textTransform: "none", fontSize: "0.75rem" }}
                  >
                    Reply
                  </Button>
                )}

                {/* More options - only show for post creator */}
                {isLoggedIn && isAuthor && (
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
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleReply}
                      disabled={!replyContent.trim()}
                    >
                      Reply
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setIsReplying(false);
                        setReplyContent("");
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Display replies */}
              {post.replies && post.replies.length > 0 && (
                <Box mt={2}>
                  {post.replies.map((reply, replyIndex) => (
                    <Reply
                      key={replyIndex}
                      reply={reply}
                      replyIndex={replyIndex}
                      postIndex={postIndex}
                      onEdit={onEditReply || (() => {})}
                      onDelete={onDeleteReply || (() => {})}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* More options menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {isLoggedIn && isAuthor && (
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
                {isDeleting ? (
                  <CircularProgress size={16} />
                ) : (
                  <DeleteIcon fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText>
                {isDeleting ? "Deleting..." : "Delete"}
              </ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default Post;
