import React from "react";
import { Stack, Typography } from "@mui/material";

interface ListSummaryProps {
  description?: string | null;
  ownerUsername?: string;
  presetCount: number;
  filmSimCount: number;
}

const ListSummary: React.FC<ListSummaryProps> = ({
  description,
  ownerUsername,
  presetCount,
  filmSimCount,
}) => {
  return (
    <Stack spacing={1}>
      {description && (
        <Typography color="text.secondary">{description}</Typography>
      )}
      <Typography variant="body2" color="text.secondary">
        Created by {ownerUsername}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {presetCount} presets • {filmSimCount} film sims
      </Typography>
    </Stack>
  );
};

export default ListSummary;
