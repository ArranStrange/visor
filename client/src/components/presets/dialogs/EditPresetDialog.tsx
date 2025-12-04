import React, { useState, useEffect } from "react";
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
import {
  PresetEditRequested,
  PresetSaveRequested,
  DialogClose,
  FormDataChange,
} from "lib/events/event-definitions";

interface EditFormData {
  title: string;
  description: string;
  notes: string;
  tags: string;
}

interface EditPresetDialogProps {
  open?: boolean;
  formData?: EditFormData;
  parsedSettings?: ParsedSettings | null;
  saveError?: string | null;
  saveSuccess?: boolean;
  updating?: boolean;
  currentSettings?: any;
  presetEffects?: any;
  onClose?: () => void;
  onFormDataChange?: (data: EditFormData) => void;
  onSettingsParsed?: (settings: ParsedSettings) => void;
  onSave?: () => void;
}

const EditPresetDialog: React.FC<EditPresetDialogProps> = ({
  open: openProp,
  formData: formDataProp,
  parsedSettings: parsedSettingsProp,
  saveError: saveErrorProp,
  saveSuccess: saveSuccessProp,
  updating: updatingProp,
  currentSettings,
  presetEffects,
  onClose: onCloseProp,
  onFormDataChange: onFormDataChangeProp,
  onSettingsParsed: onSettingsParsedProp,
  onSave: onSaveProp,
}) => {
  const [open, setOpen] = useState(openProp || false);
  const [formData, setFormData] = useState<EditFormData>(
    formDataProp || {
      title: "",
      description: "",
      notes: "",
      tags: "",
    }
  );
  const [parsedSettings, setParsedSettings] = useState<ParsedSettings | null>(
    parsedSettingsProp || null
  );
  const [saveError, setSaveError] = useState<string | null>(saveErrorProp || null);
  const [saveSuccess, setSaveSuccess] = useState(saveSuccessProp || false);
  const [updating, setUpdating] = useState(updatingProp || false);
  const [currentPreset, setCurrentPreset] = useState<any>(null);

  // Listen to PresetEditRequested event
  PresetEditRequested.useEvent(
    (data) => {
      if (data?.preset) {
        const preset = data.preset;
        setCurrentPreset(preset);
        setFormData({
          title: preset.title || "",
          description: preset.description || "",
          notes: preset.notes || "",
          tags: preset.tags?.map((tag: any) => tag?.displayName || "Unknown").join(", ") || "",
        });
        setParsedSettings(null);
        setSaveError(null);
        setSaveSuccess(false);
        setOpen(true);
      }
    },
    []
  );

  // Listen to DialogClose event
  DialogClose.useEvent(
    (data) => {
      if (data?.dialogId === "edit-preset" || !data?.dialogId) {
        setOpen(false);
        if (onCloseProp) onCloseProp();
      }
    },
    [onCloseProp]
  );

  // Sync with props if provided (backward compatibility)
  useEffect(() => {
    if (openProp !== undefined) setOpen(openProp);
  }, [openProp]);

  useEffect(() => {
    if (formDataProp) setFormData(formDataProp);
  }, [formDataProp]);

  useEffect(() => {
    if (parsedSettingsProp !== undefined) setParsedSettings(parsedSettingsProp);
  }, [parsedSettingsProp]);

  useEffect(() => {
    if (saveErrorProp !== undefined) setSaveError(saveErrorProp);
  }, [saveErrorProp]);

  useEffect(() => {
    if (saveSuccessProp !== undefined) setSaveSuccess(saveSuccessProp);
  }, [saveSuccessProp]);

  useEffect(() => {
    if (updatingProp !== undefined) setUpdating(updatingProp);
  }, [updatingProp]);

  const handleClose = () => {
    setOpen(false);
    DialogClose.raise({ dialogId: "edit-preset" });
    if (onCloseProp) onCloseProp();
  };

  const handleFormDataChange = (newData: EditFormData) => {
    setFormData(newData);
    FormDataChange.raise({
      field: "preset-edit",
      value: newData,
      formId: "edit-preset",
    });
    if (onFormDataChangeProp) onFormDataChangeProp(newData);
  };

  const handleSettingsParsed = (settings: ParsedSettings) => {
    setParsedSettings(settings);
    if (onSettingsParsedProp) onSettingsParsedProp(settings);
  };

  const handleSave = () => {
    if (currentPreset) {
      PresetSaveRequested.raise({
        presetId: currentPreset.id,
        preset: currentPreset,
        formData,
        parsedSettings,
      });
    }
    if (onSaveProp) onSaveProp();
  };
  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
              handleFormDataChange({ ...formData, title: e.target.value })
            }
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) =>
              handleFormDataChange({ ...formData, description: e.target.value })
            }
          />
          <TextField
            label="Creator Notes"
            fullWidth
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) =>
              handleFormDataChange({ ...formData, notes: e.target.value })
            }
          />
          <TextField
            label="Tags (comma-separated)"
            fullWidth
            value={formData.tags}
            onChange={(e) =>
              handleFormDataChange({ ...formData, tags: e.target.value })
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
            <XmpParser onSettingsParsed={handleSettingsParsed} />
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
        <Button onClick={handleClose} disabled={updating}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={updating}>
          {updating ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPresetDialog;
