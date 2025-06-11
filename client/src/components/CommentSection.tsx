import React from "react";
import { Box, Typography, Paper, Stack, Avatar, Divider } from "@mui/material";

interface Comment {
  id: string;
  username: string;
  avatarUrl?: string;
  content: string;
  timestamp: string;
}

interface CommentSectionProps {
  comments: Comment[];
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments }) => {
  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        Community Notes
      </Typography>
      {comments.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No notes or comments yet.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {comments.map((comment) => (
            <Paper
              key={comment.id}
              sx={{ p: 2, backgroundColor: "background.paper" }}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar src={comment.avatarUrl} alt={comment.username} />
                <Box>
                  <Typography variant="subtitle2">
                    {comment.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {comment.timestamp}
                  </Typography>
                  <Typography variant="body2" mt={0.5}>
                    {comment.content}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default CommentSection;
