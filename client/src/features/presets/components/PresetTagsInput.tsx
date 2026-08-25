import React from "react";
import {
  Box,
  Chip,
  FormControl,
  OutlinedInput,
  Typography,
} from "@mui/material";

interface PresetTagsInputProps {
  tags: string[];
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onTagKeyDown: (e: React.KeyboardEvent) => void;
  onRemoveTag: (tag: string) => void;
  disabled?: boolean;
}

const PresetTagsInput: React.FC<PresetTagsInputProps> = ({
  tags,
  tagInput,
  onTagInputChange,
  onTagKeyDown,
  onRemoveTag,
  disabled = false,
}) => {
  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Tags
      </Typography>
      {tags.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.5,
            mb: 1.5,
          }}
        >
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onDelete={disabled ? undefined : () => onRemoveTag(tag)}
              size="small"
            />
          ))}
        </Box>
      )}
      <FormControl fullWidth>
        <OutlinedInput
          value={tagInput}
          onChange={(e) => onTagInputChange(e.target.value)}
          onKeyDown={onTagKeyDown}
          placeholder="Add tags (press Enter)"
          disabled={disabled}
          data-cy="preset-tags-input"
        />
      </FormControl>
    </Box>
  );
};

export default PresetTagsInput;
