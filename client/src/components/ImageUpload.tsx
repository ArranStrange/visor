import React from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

interface ImagePreviewProps {
  file: File;
  uploadedUrl?: string;
  index: number;
  onRemove: (index: number) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  file,
  uploadedUrl,
  index,
  onRemove,
}) => (
  <Grid {...(undefined as any)} item xs={12} sm={6} md={4}>
    <Paper
      sx={{
        p: 1,
        position: "relative",
        "&:hover .delete-button": {
          opacity: 1,
        },
      }}
    >
      <Box
        component="img"
        src={uploadedUrl || URL.createObjectURL(file)}
        alt={`Sample ${index + 1}`}
        sx={{
          width: "100%",
          height: 200,
          objectFit: "cover",
          borderRadius: 1,
        }}
      />
      <IconButton
        size="small"
        onClick={() => onRemove(index)}
        className="delete-button"
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          bgcolor: "rgba(0,0,0,0.5)",
          color: "white",
          opacity: 0,
          transition: "opacity 0.2s",
          "&:hover": {
            bgcolor: "rgba(0,0,0,0.7)",
          },
        }}
      >
        <DeleteIcon />
      </IconButton>
    </Paper>
  </Grid>
);

interface ImageUploadProps {
  sampleImages: File[];
  uploadedImageUrls: Array<{ publicId: string; url: string }>;
  isUploading: boolean;
  fileError: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  disabled?: boolean;
  title?: string;
  description?: string;
  acceptedTypes?: string;
  dataCy?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  sampleImages,
  uploadedImageUrls,
  isUploading,
  fileError,
  onImageChange,
  onRemoveImage,
  disabled = false,
  title = "Sample Images *",
  description = "At least one sample image is required (max 25MB, JPEG/PNG/WebP)",
  acceptedTypes = "image/jpeg,image/png,image/webp",
  dataCy = "image-upload",
}) => {
  const hasImages = sampleImages.length > 0;
  const isDisabled = disabled || isUploading;

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {description}
      </Typography>

      <Button
        component="label"
        variant="outlined"
        sx={{ mt: 1 }}
        disabled={isDisabled}
        startIcon={isUploading ? <CircularProgress size={20} /> : null}
        data-cy={dataCy}
      >
        {isUploading ? "Uploading..." : "Add Images"}
        <input
          type="file"
          accept={acceptedTypes}
          onChange={onImageChange}
          multiple
          style={{ display: "none" }}
        />
      </Button>

      {isUploading && (
        <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
          Uploading images to Cloudinary...
        </Typography>
      )}

      {fileError && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {fileError}
        </Alert>
      )}

      {hasImages && (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {sampleImages.map((file, index) => (
              <ImagePreview
                key={index}
                file={file}
                uploadedUrl={uploadedImageUrls[index]?.url}
                index={index}
                onRemove={onRemoveImage}
              />
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default ImageUpload;
