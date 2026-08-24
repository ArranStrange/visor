import React from "react";
import { Box, Typography, Chip, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

interface ListHeaderViewProps {
  name: string;
  isPublic: boolean;
  isOwner: boolean;
  onStartEdit: () => void;
}

const ListHeaderView: React.FC<ListHeaderViewProps> = ({
  name,
  isPublic,
  isOwner,
  onStartEdit,
}) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Box display="flex" alignItems="center" gap={2} flex={1}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
          {name}
        </Typography>
        <Chip
          label={isPublic ? "Public" : "Private"}
          color={isPublic ? "primary" : "default"}
          size="small"
        />
      </Box>
      {isOwner && (
        <Button startIcon={<EditIcon />} onClick={onStartEdit}>
          Edit List
        </Button>
      )}
    </Box>
  );
};

export default ListHeaderView;
