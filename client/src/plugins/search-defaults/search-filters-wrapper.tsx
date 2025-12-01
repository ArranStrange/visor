import React from "react";
import { Box } from "@mui/material";
import TagsList from "components/ui/TagsList";

export function SearchFiltersWrapper({
  tags,
  activeTagId,
  onTagClick,
  onClear,
  tagsLoading,
}: any) {
  return (
    <Box sx={{ mb: 2 }}>
      <TagsList
        tags={tags}
        activeTagId={activeTagId}
        onTagClick={onTagClick}
        onClear={onClear}
        isLoading={tagsLoading}
      />
    </Box>
  );
}

