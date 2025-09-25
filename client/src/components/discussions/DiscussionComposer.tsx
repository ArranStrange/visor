import React from "react";
import { Card, CardContent } from "@mui/material";
import PostComposer from "./PostComposer";

interface DiscussionComposerProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  buttonText?: string;
  isCreating?: boolean;
  showPreviewOnly?: boolean;
}

const DiscussionComposer: React.FC<DiscussionComposerProps> = ({
  onSubmit,
  placeholder = "Add to the discussion...",
  buttonText = "Post",
  isCreating = false,
  showPreviewOnly = false,
}) => {
  if (showPreviewOnly) {
    return null;
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <PostComposer
          onSubmit={onSubmit}
          placeholder={placeholder}
          buttonText={isCreating ? "Posting..." : buttonText}
        />
      </CardContent>
    </Card>
  );
};

export default DiscussionComposer;
