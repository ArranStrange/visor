import React from "react";
import { List, ListItem, ListItemText, Typography } from "@mui/material";

interface Preset {
  id: string;
  title: string;
}

interface CurrentPresetsListProps {
  presets: Preset[];
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
