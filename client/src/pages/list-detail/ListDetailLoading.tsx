import React from "react";
import { Box, CircularProgress } from "@mui/material";

const ListDetailLoading: React.FC = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
    <CircularProgress />
  </Box>
);

export default ListDetailLoading;
