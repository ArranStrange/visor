import React from "react";
import { Box, Alert, Typography, Button } from "@mui/material";

interface DiscussionErrorStateProps {
  error: Error;
  onRetry: () => void;
  onCreateNew: () => void;
}

const DiscussionErrorState: React.FC<DiscussionErrorStateProps> = ({
  error,
  onRetry,
  onCreateNew,
}) => {
  return (
    <Box py={4}>
      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Error Loading Discussions
        </Typography>
        <Typography variant="body2" gutterBottom>
          {error.message}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={onRetry} sx={{ mr: 2 }}>
            Retry
          </Button>
          <Button variant="outlined" onClick={onCreateNew}>
            Create New Discussion
          </Button>
        </Box>
      </Alert>
    </Box>
  );
};

export default DiscussionErrorState;
