import React from "react";
import { Box, Typography, Paper } from "@mui/material";

interface FileUploadProps {
  accept: string;
  onFileSelect: (file: File) => void;
  label: string;
  id: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  onFileSelect,
  label,
  id,
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <Box>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: "none" }}
        id={id}
        data-cy={id}
      />
      <label htmlFor={id}>
        <Paper
          sx={{
            p: 3,
            textAlign: "center",
            cursor: "pointer",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <Typography>{label}</Typography>
        </Paper>
      </label>
    </Box>
  );
};

export default FileUpload;
