import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import DiscussionComposer from "./DiscussionComposer";

interface DiscussionThreadEmptyStateProps {
  itemType: "preset" | "filmsim";
  showPreviewOnly?: boolean;
  user: any;
  onCreatePost: (content: string) => void;
  isCreating?: boolean;
}

const DiscussionThreadEmptyState: React.FC<DiscussionThreadEmptyStateProps> = ({
  itemType,
  showPreviewOnly = false,
  user,
  onCreatePost,
  isCreating = false,
}) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Discussions
        </Typography>
        {!showPreviewOnly && (
          <Typography variant="body2" color="text.secondary" mb={2}>
            No discussion thread found for this {itemType}.
          </Typography>
        )}
        {user && !showPreviewOnly && (
          <DiscussionComposer
            onSubmit={onCreatePost}
            placeholder={`Start a discussion about this ${itemType}...`}
            buttonText="Start Discussion"
            isCreating={isCreating}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default DiscussionThreadEmptyState;
