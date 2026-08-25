import React from "react";
import { Container, Box, Typography, Alert } from "@mui/material";
import { ApolloError } from "@apollo/client";
import { getErrorMessage } from "../../utils/errorHandling";

interface DiscussionNotFoundProps {
  discussionId: string;
  error?: ApolloError;
}

const DiscussionNotFound: React.FC<DiscussionNotFoundProps> = ({
  discussionId,
  error,
}) => (
  <Container maxWidth="lg">
    <Box py={4}>
      <Typography variant="h4" gutterBottom>
        Discussion not found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Discussion ID: {discussionId}
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Error: {getErrorMessage(error, "Unknown error")}
        </Alert>
      )}
    </Box>
  </Container>
);

export default DiscussionNotFound;
