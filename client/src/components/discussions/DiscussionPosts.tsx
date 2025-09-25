import React, { useState } from "react";
import { Box, Button, Alert } from "@mui/material";
import { DiscussionPost } from "../../types/discussions";
import Post from "./Post";

interface DiscussionPostsProps {
  posts: DiscussionPost[];
  onEdit: (postIndex: number, content: string) => void;
  onDelete: (postIndex: number) => void;
  isEmbedded?: boolean;
  deleteError?: string | null;
  onClearDeleteError?: () => void;
}

const DiscussionPosts: React.FC<DiscussionPostsProps> = ({
  posts,
  onEdit,
  onDelete,
  isEmbedded = true,
  deleteError,
  onClearDeleteError,
}) => {
  const [showFullThread, setShowFullThread] = useState(false);

  const displayPosts =
    isEmbedded && !showFullThread ? posts.slice(0, 3) : posts;
  const hasMorePosts = isEmbedded && posts.length > 3;

  return (
    <Box>
      {deleteError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={onClearDeleteError}>
          {deleteError}
        </Alert>
      )}

      {displayPosts.length === 0 ? (
        <Alert severity="info">
          No posts yet. Be the first to join the discussion!
        </Alert>
      ) : (
        displayPosts.map((post: DiscussionPost, index: number) => (
          <Post
            key={index}
            post={post}
            postIndex={index}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}

      {hasMorePosts && (
        <Box textAlign="center" mt={2}>
          <Button variant="outlined" onClick={() => setShowFullThread(true)}>
            View all {posts.length} posts
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DiscussionPosts;
