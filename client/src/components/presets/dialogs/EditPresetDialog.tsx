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
  Alert,
} from "@mui/material";
import XmpParser from "../../settings/XmpParser";
import XmpSettingsDisplay from "../../settings/XmpSettingsDisplay";
import { ParsedSettings } from "../../../types/xmpSettings";

interface EditFormData {
  title: string;
  description: string;
  notes: string;
  tags: string;
}

interface EditPresetDialogProps {
  open: boolean;
  formData: EditFormData;
  parsedSettings: ParsedSettings | null;
  saveError: string | null;
  saveSuccess: boolean;
  updating: boolean;
  currentSettings: any;
  presetEffects: any;
  onClose: () => void;
  onFormDataChange: (data: EditFormData) => void;
  onSettingsParsed: (settings: ParsedSettings) => void;
  onSave: () => void;
}

const EditPresetDialog: React.FC<EditPresetDialogProps> = ({
  open,
  formData,
  parsedSettings,
  saveError,
  saveSuccess,
  updating,
  onClose,
  onFormDataChange,
  onSettingsParsed,
  onSave,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={window.innerWidth < 768}
      PaperProps={{
        sx: {
          backgroundColor: "background.paper",
          maxHeight: window.innerWidth < 768 ? "100vh" : "90vh",
          height: window.innerWidth < 768 ? "100vh" : "auto",
        },
      }}
      disableEnforceFocus={window.innerWidth < 768}
      disableAutoFocus={false}
      keepMounted={false}
    >
      <DialogTitle>Edit Preset</DialogTitle>
      <DialogContent sx={{ overflowY: "auto", pb: 2 }}>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="Title"
            fullWidth
            value={formData.title}
            onChange={(e) =>
              onFormDataChange({ ...formData, title: e.target.value })
            }
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) =>
              onFormDataChange({ ...formData, description: e.target.value })
            }
          />
          <TextField
            label="Creator Notes"
            fullWidth
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) =>
              onFormDataChange({ ...formData, notes: e.target.value })
            }
          />
          <TextField
            label="Tags (comma-separated)"
            fullWidth
            value={formData.tags}
            onChange={(e) =>
              onFormDataChange({ ...formData, tags: e.target.value })
            }
            placeholder="e.g., portrait, landscape, street"
          />

          <Box>
            <Typography variant="h6" gutterBottom>
              Update Settings from XMP File
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Upload a new XMP file to update the preset settings. This will
              overwrite the current settings.
            </Typography>
            <XmpParser onSettingsParsed={onSettingsParsed} />
            {parsedSettings && (
              <Alert severity="success" sx={{ mt: 2 }}>
                XMP file parsed successfully! Settings will be updated when you
                save.
              </Alert>
            )}
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

          {saveSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Preset updated successfully!
            </Alert>
          )}
          {saveError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {saveError}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, pb: window.innerWidth < 768 ? 4 : 2 }}>
        <Button onClick={onClose} disabled={updating}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onSave} disabled={updating}>
          {updating ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPresetDialog;
