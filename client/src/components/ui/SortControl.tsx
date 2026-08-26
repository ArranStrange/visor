import React from "react";
import { Box, MenuItem, TextField } from "@mui/material";
import type { ContentSort } from "@/types/graphql";
import { useContentType } from "../../context/ContentTypeFilter";

/**
 * Ordering for the discovery grid.
 *
 * "Popular" rather than "Trending" on purpose: the score behind it has no time
 * decay, so a label promising recency would describe an algorithm the server
 * does not implement.
 *
 * Rendered separately from ContentTypeToggle so it can survive sensor mode,
 * where SearchView replaces the content-type toggle with the sensor profile
 * card but still lists film sims that need ordering.
 */
const SORT_OPTIONS: ReadonlyArray<{ value: ContentSort; label: string }> = [
  { value: "NEWEST", label: "Newest" },
  { value: "POPULAR", label: "Popular" },
  { value: "MOST_DOWNLOADED", label: "Most downloaded" },
  { value: "MOST_SAVED", label: "Most saved" },
];

const SortControl: React.FC = () => {
  const { sort, setSort } = useContentType();

  return (
    <Box display="flex" justifyContent="center" mt={2} mb={2}>
      <TextField
        select
        size="small"
        label="Sort"
        value={sort}
        onChange={(event) => setSort(event.target.value as ContentSort)}
        // Choosing an order turns shuffle off in the context, so the two
        // cannot both claim to be ordering the grid.
        sx={{ minWidth: 200 }}
        slotProps={{ htmlInput: { "aria-label": "Sort content" } }}
      >
        {SORT_OPTIONS.map(({ value, label }) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default SortControl;
