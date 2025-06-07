import React, { useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

const SearchView: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate]);

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1500,
        backgroundColor: "background.default",
        p: 4,
      }}
    >
      <IconButton
        onClick={() => navigate(-1)}
        sx={{ position: "absolute", top: 16, right: 16 }}
      >
        <CloseIcon />
      </IconButton>
      <Typography variant="h4" fontWeight="bold">
        Search
      </Typography>

      {/* Add search input, results, etc. here */}
    </Box>
  );
};

export default SearchView;
