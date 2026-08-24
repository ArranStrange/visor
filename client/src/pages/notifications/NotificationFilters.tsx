import React from "react";
import {
  Card,
  CardContent,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { NotificationType } from "../../types/notifications";

type StatusFilter = "all" | "unread" | "read";
type TypeFilter = NotificationType | "all";

interface NotificationFiltersProps {
  filter: StatusFilter;
  typeFilter: TypeFilter;
  onFilterChange: (filter: StatusFilter) => void;
  onTypeFilterChange: (typeFilter: TypeFilter) => void;
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filter,
  typeFilter,
  onFilterChange,
  onTypeFilterChange,
}) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
          <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select value={filter} onChange={handleStatusChange} label="Status">
              <MenuItem value="all">All notifications</MenuItem>
              <MenuItem value="unread">Unread only</MenuItem>
              <MenuItem value="read">Read only</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Type</InputLabel>
            <Select value={typeFilter} onChange={handleTypeChange} label="Type">
              <MenuItem value="all">All types</MenuItem>
              <MenuItem value={NotificationType.DISCUSSION_REPLY}>
                Replies
              </MenuItem>
              <MenuItem value={NotificationType.DISCUSSION_OWNER_REPLY}>
                Owner replies
              </MenuItem>
              <MenuItem value={NotificationType.MENTION}>Mentions</MenuItem>
              <MenuItem value={NotificationType.FOLLOW}>Follows</MenuItem>
              <MenuItem value={NotificationType.LIKE}>Likes</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </CardContent>
    </Card>
  );

  function handleStatusChange(e: SelectChangeEvent) {
    onFilterChange(e.target.value as StatusFilter);
  }

  function handleTypeChange(e: SelectChangeEvent) {
    onTypeFilterChange(e.target.value as TypeFilter);
  }
};

export default NotificationFilters;
