import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { DiscussionFilters as DiscussionFiltersType } from "../../types/discussionFilters";
import { getSortIcon } from "../../utils/discussionIcons";

interface DiscussionFiltersProps {
  filters: DiscussionFiltersType;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onSortChange: (value: string) => void;
  loading: boolean;
  resultCount: number;
}

const DiscussionFilters: React.FC<DiscussionFiltersProps> = ({
  filters,
  onSearchChange,
  onTypeChange,
  onSortChange,
  loading,
  resultCount,
}) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
          <Box flex="1" minWidth={300}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search discussions, posts, and content..."
              value={filters.search}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
                endAdornment: filters.search && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mr: 1 }}
                  >
                    {loading ? "Searching..." : `${resultCount} results`}
                  </Typography>
                ),
              }}
            />
          </Box>
          <Box minWidth={200}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => onTypeChange(e.target.value)}
                label="Type"
                startAdornment={
                  <FilterIcon sx={{ mr: 1, color: "text.secondary" }} />
                }
              >
                <MenuItem value="all">All discussions</MenuItem>
                <MenuItem value="PRESET">Preset discussions</MenuItem>
                <MenuItem value="FILMSIM">Film sim discussions</MenuItem>
                <MenuItem value="TECHNIQUE">Technique discussions</MenuItem>
                <MenuItem value="EQUIPMENT">Equipment discussions</MenuItem>
                <MenuItem value="LOCATION">Location discussions</MenuItem>
                <MenuItem value="TUTORIAL">Tutorial discussions</MenuItem>
                <MenuItem value="REVIEW">Review discussions</MenuItem>
                <MenuItem value="CHALLENGE">Challenge discussions</MenuItem>
                <MenuItem value="WORKFLOW">Workflow discussions</MenuItem>
                <MenuItem value="INSPIRATION">Inspiration discussions</MenuItem>
                <MenuItem value="CRITIQUE">Critique discussions</MenuItem>
                <MenuItem value="NEWS">News discussions</MenuItem>
                <MenuItem value="EVENT">Event discussions</MenuItem>
                <MenuItem value="GENERAL">General discussions</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box minWidth={200}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort by</InputLabel>
              <Select
                value={filters.sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                label="Sort by"
                startAdornment={getSortIcon(filters.sortBy || "newest")}
              >
                <MenuItem value="newest">Newest first</MenuItem>
                <MenuItem value="oldest">Oldest first</MenuItem>
                <MenuItem value="mostActive">Most active</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {resultCount} discussions
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DiscussionFilters;
