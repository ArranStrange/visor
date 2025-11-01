import React from "react";
import { Box, Button, InputLabel } from "@mui/material";

interface PresetImageUploadProps {
  label: string;
  fileName: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id: string;
  disabled?: boolean;
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const PresetImageUpload: React.FC<PresetImageUploadProps> = ({
  label,
  fileName,
  onFileChange,
  id,
  disabled = false,
}) => {
  return (
    <Box>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <Button
        component="label"
        variant="outlined"
        sx={{ mt: 1 }}
        disabled={disabled}
      >
        {fileName || `Upload ${label}`}
        <input
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          onChange={onFileChange}
          style={{ display: "none" }}
          id={id}
          data-cy={id}
          disabled={disabled}
        />
      </Button>
    </Box>
  );
};

export default PresetImageUpload;
