import React from "react";
import { Stack, TextField, Box, Typography } from "@mui/material";
import XmpParser from "../settings/XmpParser";
import XmpSettingsDisplay from "../settings/XmpSettingsDisplay";
import PresetTagsInput from "./PresetTagsInput";
import PresetImageUpload from "./PresetImageUpload";
import { ParsedSettings } from "../../types/xmpSettings";

interface PresetUploadFormProps {
  title: string;
  description: string;
  tags: string[];
  tagInput: string;
  beforeImage: File | null;
  afterImage: File | null;
  notes: string;
  parsedSettings: ParsedSettings | null;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onTagInputChange: (value: string) => void;
  onTagKeyDown: (e: React.KeyboardEvent) => void;
  onRemoveTag: (tag: string) => void;
  onBeforeImageChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>;
  onAfterImageChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onNotesChange: (notes: string) => void;
  onSettingsParsed: (settings: ParsedSettings) => void;
  disabled?: boolean;
}

const PresetUploadForm: React.FC<PresetUploadFormProps> = ({
  title,
  description,
  tags,
  tagInput,
  beforeImage,
  afterImage,
  notes,
  parsedSettings,
  onTitleChange,
  onDescriptionChange,
  onTagInputChange,
  onTagKeyDown,
  onRemoveTag,
  onBeforeImageChange,
  onAfterImageChange,
  onNotesChange,
  onSettingsParsed,
  disabled = false,
}) => {
  return (
    <Stack spacing={3}>
      <TextField
        label="Title"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        required
        disabled={disabled}
        data-cy="preset-title-input"
      />

      <TextField
        label="Description"
        multiline
        minRows={3}
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        disabled={disabled}
        data-cy="preset-description-input"
      />

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          XMP File
        </Typography>
        <XmpParser onSettingsParsed={onSettingsParsed} />
      </Box>

      {parsedSettings && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Parsed Settings Preview
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Preview of the settings that will be applied from the XMP file:
          </Typography>
          <XmpSettingsDisplay settings={parsedSettings} />
        </Box>
      )}

      <PresetTagsInput
        tags={tags}
        tagInput={tagInput}
        onTagInputChange={onTagInputChange}
        onTagKeyDown={onTagKeyDown}
        onRemoveTag={onRemoveTag}
        disabled={disabled}
      />

      <PresetImageUpload
        label="Before Image"
        fileName={beforeImage?.name || null}
        onFileChange={onBeforeImageChange}
        id="before-image-input"
        disabled={disabled}
      />

      <PresetImageUpload
        label="After Image"
        fileName={afterImage?.name || null}
        onFileChange={onAfterImageChange}
        id="after-image-input"
        disabled={disabled}
      />

      <TextField
        label="Creator Notes"
        multiline
        minRows={3}
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        disabled={disabled}
        data-cy="preset-notes-input"
      />
    </Stack>
  );
};

export default PresetUploadForm;
