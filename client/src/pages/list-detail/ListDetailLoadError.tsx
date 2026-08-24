import React from "react";
import { Container, Alert } from "@mui/material";

interface ListDetailLoadErrorProps {
  message?: string;
}

const ListDetailLoadError: React.FC<ListDetailLoadErrorProps> = ({
  message,
}) => (
  <Container maxWidth="md" sx={{ mt: 4 }}>
    <Alert severity="error">Error loading list: {message}</Alert>
  </Container>
);

export default ListDetailLoadError;
