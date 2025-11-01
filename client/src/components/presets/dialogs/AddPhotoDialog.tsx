import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface AddPhotoDialogProps {
  open: boolean;
  presetTitle: string;
  photoFile: File | null;
  photoCaption: string;
  uploading: boolean;
  onClose: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCaptionChange: (value: string) => void;
  onUpload: () => void;
}

const AddPhotoDialog: React.FC<AddPhotoDialogProps> = ({
  open,
  presetTitle,
  photoFile,
  photoCaption,
  uploading,
  onClose,
  onFileChange,
  onCaptionChange,
  onUpload,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Add Your Photo</Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Share a photo you've edited using the "{presetTitle}" preset
          </Typography>

          <Box>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ py: 2 }}
            >
              {photoFile ? photoFile.name : "Choose Photo"}
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                style={{ display: "none" }}
              />
            </Button>
          </Box>

          {photoFile && (
            <Box>
              <img
                src={URL.createObjectURL(photoFile)}
                alt="Preview"
                style={{
                  width: "100%",
                  maxHeight: 200,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            </Box>
          )}

          <TextField
            label="Caption (optional)"
            value={photoCaption}
            onChange={(e) => onCaptionChange(e.target.value)}
            multiline
            rows={2}
            placeholder="Describe your photo or how you used the preset..."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onUpload}
          variant="contained"
          disabled={!photoFile || uploading}
          startIcon={uploading ? <CircularProgress size={20} /> : null}
        >
          {uploading ? "Uploading..." : "Upload Photo"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPhotoDialog;

