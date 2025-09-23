import React from "react";
import {
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Chip,
} from "@mui/material";

interface Preset {
  id: string;
  title: string;
  description?: string;
  afterImage?: { url: string };
  creator?: { id: string; username: string; avatar?: string };
  tags?: Array<{ displayName: string; id?: string }>;
}

interface PresetSearchItemProps {
  preset: Preset;
  isSelected: boolean;
  onSelect: (presetId: string) => void;
}

const PresetSearchItem: React.FC<PresetSearchItemProps> = ({
  preset,
  isSelected,
  onSelect,
}) => {
  return (
    <ListItemButton selected={isSelected} onClick={() => onSelect(preset.id)}>
      <ListItemAvatar>
        <Avatar
          src={preset.afterImage?.url}
          alt={preset.title}
          variant="rounded"
        />
      </ListItemAvatar>
      <ListItemText
        primary={preset.title}
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary">
              by {preset.creator?.username}
            </Typography>
            {preset.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {preset.description}
              </Typography>
            )}
            {preset.tags && preset.tags.length > 0 && (
              <Box sx={{ mt: 0.5 }}>
                {preset.tags.slice(0, 3).map((tag, index) => (
                  <Chip
                    key={tag.id || index}
                    label={tag.displayName}
                    size="small"
                    variant="outlined"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>
            )}
          </Box>
        }
      />
    </ListItemButton>
  );
};

export default PresetSearchItem;
