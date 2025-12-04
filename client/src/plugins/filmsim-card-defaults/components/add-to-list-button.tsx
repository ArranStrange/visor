import React from "react";
import { Box, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { overlayButtonStyles } from "styles/cardOverlays";

export function AddToListButton({
  id: _id,
  name: _name,
  onAddToList,
}: {
  id: string;
  name: string;
  onAddToList?: (e: React.MouseEvent) => void;
}) {
  return (
    <Box className="add-to-list-button" sx={overlayButtonStyles}>
      <IconButton
        className="floating"
        onClick={onAddToList}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
