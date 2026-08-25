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
import { optimizeImageUrl } from "../../utils/cloudinary";
import type { PresetSummary } from "../../types/graphql";

interface PresetSearchItemProps {
  preset: PresetSummary;
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
          src={optimizeImageUrl(preset.afterImage?.url, 100)}
          alt={preset.title}
          variant="rounded"
          slotProps={{ img: { loading: "lazy" } }}
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
