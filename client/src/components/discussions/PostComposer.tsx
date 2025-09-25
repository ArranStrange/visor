import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Typography,
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";

interface PostComposerProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  buttonText?: string;
}

const PostComposer: React.FC<PostComposerProps> = ({
  onSubmit,
  placeholder = "Share your thoughts...",
  buttonText = "Post",
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!content.trim() || !user) return;

    onSubmit(content);
    setContent("");
  };

  if (!user) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box textAlign="center" py={2}>
            <Typography variant="body2" color="text.secondary">
              Please log in to join the discussion
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* User info */}
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar src={user.avatar} sx={{ width: 32, height: 32 }}>
            {user.username.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="subtitle2">{user.username}</Typography>
        </Box>

        {/* Content input */}
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
        />

        {/* Submit button */}
        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSubmit}
            disabled={!content.trim()}
          >
            {buttonText}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PostComposer;
