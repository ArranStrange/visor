import React from "react";
import { Box, Card, CardContent, Alert } from "@mui/material";
import { Discussion, DiscussionPost } from "@/features/discussions/types/discussions";
import Post from "@/features/discussions/components/Post";
import PostComposer from "@/features/discussions/components/PostComposer";

interface PostsSectionProps {
  discussion: Discussion;
  showComposer: boolean;
  onCreatePost: (content: string) => void;
  onEdit: (postIndex: number, content: string) => void;
  onDelete: (postIndex: number) => void;
  onReply: (postIndex: number, content: string) => void;
  onEditReply: (
    postIndex: number,
    replyIndex: number,
    content: string
  ) => void;
  onDeleteReply: (postIndex: number, replyIndex: number) => void;
}

const PostsSection: React.FC<PostsSectionProps> = ({
  discussion,
  showComposer,
  onCreatePost,
  onEdit,
  onDelete,
  onReply,
  onEditReply,
  onDeleteReply,
}) => {
  const posts = discussion.posts || [];

  return (
    <>
      {showComposer && (
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
            <PostComposer
              onSubmit={onCreatePost}
              placeholder="Add to the discussion..."
              buttonText="Post"
            />
          </CardContent>
        </Card>
      )}

      <Box>
        {posts.length === 0 ? (
          <Alert severity="info">
            No posts yet. Be the first to join the discussion!
          </Alert>
        ) : (
          posts.map((post: DiscussionPost, index: number) => (
            <Post
              key={index}
              post={post}
              postIndex={index}
              discussionId={discussion.id}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
              onEditReply={onEditReply}
              onDeleteReply={onDeleteReply}
            />
          ))
        )}
      </Box>
    </>
  );
};

export default PostsSection;
