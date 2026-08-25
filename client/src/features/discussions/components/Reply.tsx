import React, { useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatDistanceToNow } from "date-fns";
import { useMutation } from "@apollo/client";
import { useAuth } from "@/context/AuthContext";
import { DiscussionReply as ReplyType } from "@/features/discussions/types/discussions";
import {
  ADMIN_DELETE_REPLY,
  GET_DISCUSSION,
} from "@/features/discussions/graphql/discussions";

interface ReplyProps {
  reply: ReplyType;
  replyIndex: number;
  postIndex: number;
  discussionId: string;
  onEdit: (postIndex: number, replyIndex: number, content: string) => void;
  onDelete: (postIndex: number, replyIndex: number) => void;
}

const Reply: React.FC<ReplyProps> = ({
  reply,
  replyIndex,
  postIndex,
  discussionId,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [adminDeleteReply] = useMutation(ADMIN_DELETE_REPLY, {
    refetchQueries: [
      { query: GET_DISCUSSION, variables: { id: discussionId } },
    ],
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    if (!editContent.trim()) return;
    onEdit(postIndex, replyIndex, editContent);
    setIsEditing(false);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(postIndex, replyIndex);
    handleMenuClose();
  };

  const handleAdminDelete = async () => {
    try {
      await adminDeleteReply({
        variables: { discussionId, postIndex, replyIndex },
      });
      handleMenuClose();
    } catch (error) {
      console.error("Error deleting reply:", error);
    }
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

  const isAuthor = user?.id === reply.userId;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        py: 1,
        pl: 2,
        borderLeft: "2px solid",
        borderColor: "divider",
      }}
    >
      <Avatar src={reply.avatar} sx={{ width: 24, height: 24 }}>
        {reply.username.charAt(0).toUpperCase()}
      </Avatar>

      <Box flex={1}>
        <Box display="flex" alignItems="center" gap={1} mb={0.25}>
          <Typography variant="caption" fontWeight="bold">
            {reply.username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(reply.timestamp)}
          </Typography>
          {reply.isEdited && (
            <Typography variant="caption" color="text.secondary">
              (edited)
            </Typography>
          )}
          {(isAuthor || user?.isAdmin) && (
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ ml: "auto", p: 0.25 }}
            >
              <MoreVertIcon sx={{ typography: "body2" }} />
            </IconButton>
          )}
        </Box>

        {!isEditing ? (
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {reply.content}
          </Typography>
        ) : (
          <Box>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              size="small"
              sx={{ mb: 1 }}
            />
            <Box display="flex" gap={1}>
              <Button size="small" variant="contained" onClick={handleEdit}>
                Save
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(reply.content);
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </Box>

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
        {user?.isAdmin && !isAuthor && (
          <MenuItem onClick={handleAdminDelete} sx={{ color: "error.main" }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete (Admin)</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default Reply;
