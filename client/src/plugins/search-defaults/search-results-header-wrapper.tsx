import React from "react";
import { Box, InputBase, Divider } from "@mui/material";
import ContentTypeToggle from "components/ui/ContentTypeToggle";

export function SearchResultsHeaderWrapper({
  keyword,
  onKeywordChange,
}: any) {
  return (
    <>
      <InputBase
        placeholder="Search presets, film sims, tags…"
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        fullWidth
        sx={{
          px: 2,
          py: 1,
          borderRadius: 2,
          backgroundColor: "rgba(255,255,255,0.08)",
          color: "white",
          mb: 2,
        }}
      />
      <Box sx={{ mb: 2 }}>
        <ContentTypeToggle />
      </Box>
      <Divider sx={{ my: 2 }} />
    </>
  );
}

