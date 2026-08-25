import React from "react";
import { List, ListItem, ListItemText, Typography } from "@mui/material";
import type { PresetSummary } from "../../types/graphql";

interface CurrentPresetsListProps {
  presets: PresetSummary[];
}

const CurrentPresetsList: React.FC<CurrentPresetsListProps> = ({ presets }) => {
  if (presets.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No recommended presets yet.
      </Typography>
    );
  }

  return (
    <List>
      {presets.map((preset) => (
        <ListItem key={preset.id} disableGutters>
          <ListItemText primary={preset.title} />
        </ListItem>
      ))}
    </List>
  );
};

export default CurrentPresetsList;
