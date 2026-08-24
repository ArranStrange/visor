import React from "react";
import { Container, Box, Alert } from "@mui/material";
import { ApolloError } from "@apollo/client";

interface DiscussionLoadErrorProps {
  error: ApolloError;
}

const DiscussionLoadError: React.FC<DiscussionLoadErrorProps> = ({
  error,
}) => (
  <Container maxWidth="lg">
    <Box py={4}>
      <Alert severity="error">Error loading discussion: {error.message}</Alert>
    </Box>
  </Container>
);

export default DiscussionLoadError;
