import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { DiscussionFilters as DiscussionFiltersType } from "../../types/discussionFilters";

interface DiscussionEmptyStateProps {
  filters: DiscussionFiltersType;
  onClearSearch: () => void;
}

const DiscussionEmptyState: React.FC<DiscussionEmptyStateProps> = ({
  filters,
  onClearSearch,
}) => {
  const hasActiveFilters = filters.search || filters.type !== "all";

  return (
    <Box textAlign="center" py={6}>
      <Typography variant="h6" gutterBottom>
        No discussions found
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {hasActiveFilters
          ? "Try adjusting your search or filters to find more discussions."
          : "Be the first to start a discussion!"}
      </Typography>
      {hasActiveFilters && (
        <Button variant="outlined" onClick={onClearSearch}>
          Clear Filters
        </Button>
      )}
    </Box>
  );
};

export default DiscussionEmptyState;
