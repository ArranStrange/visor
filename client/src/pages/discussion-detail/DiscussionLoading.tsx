import React from "react";
import { Container, Box, CircularProgress } from "@mui/material";

const DiscussionLoading: React.FC = () => (
  <Container maxWidth="lg">
    <Box py={4} display="flex" justifyContent="center">
      <CircularProgress />
    </Box>
  </Container>
);

export default DiscussionLoading;
