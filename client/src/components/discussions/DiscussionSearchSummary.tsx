import React from "react";
import { Box, Typography } from "@mui/material";
import { DiscussionFilters as DiscussionFiltersType } from "../../types/discussionFilters";
import { DiscussionTargetType } from "../../types/discussions";
import { getDiscussionTypeLabel } from "../../utils/discussionIcons";

interface DiscussionSearchSummaryProps {
  filters: DiscussionFiltersType;
  loading: boolean;
  resultCount: number;
}

const DiscussionSearchSummary: React.FC<DiscussionSearchSummaryProps> = ({
  filters,
  loading,
  resultCount,
}) => {
  if (!filters.search) return null;

  return (
    <Box mb={2}>
      <Typography variant="body2" color="text.secondary">
        {loading ? (
          "Searching..."
        ) : (
          <>
            Found {resultCount} discussion{resultCount !== 1 ? "s" : ""}
            {filters.type !== "all" &&
              ` in ${getDiscussionTypeLabel(
                filters.type as DiscussionTargetType
              )}`}
            {filters.search && ` matching "${filters.search}"`}
          </>
        )}
      </Typography>
    </Box>
  );
};

export default DiscussionSearchSummary;
