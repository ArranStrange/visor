import React from "react";
import { Container, Box, Alert } from "@mui/material";
import { ApolloError } from "@apollo/client";
import { getErrorMessage } from "../../utils/errorHandling";

interface DiscussionLoadErrorProps {
  error: ApolloError;
}

const DiscussionLoadError: React.FC<DiscussionLoadErrorProps> = ({
  error,
}) => (
  <Container maxWidth="lg">
    <Box py={4}>
      <Alert severity="error">
        Error loading discussion: {getErrorMessage(error)}
      </Alert>
    </Box>
  </Container>
);

export default DiscussionLoadError;
