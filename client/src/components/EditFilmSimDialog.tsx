import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useMutation } from "@apollo/client";
import { UPDATE_FILMSIM } from "../graphql/mutations/updateFilmSim";

import { FilmSimData, useFilmSimForm } from "../hooks/useFilmSimForm";
import FilmSimSettingsForm from "./FilmSimSettingsForm";

interface EditFilmSimDialogProps {
  open: boolean;
  onClose: () => void;
  filmSim: FilmSimData;
  onSave?: (updatedData: any) => void;
  onSuccess?: () => void;
}

const EditFilmSimDialog: React.FC<EditFilmSimDialogProps> = ({
  open,
  onClose,
  filmSim,
  onSave,
  onSuccess,
}) => {
  const [updateFilmSim, { loading: updating, error }] =
    useMutation(UPDATE_FILMSIM);

  const { formData, handleInputChange, createUpdateInput } =
    useFilmSimForm(filmSim);

  if (!filmSim || !filmSim.id) {
    return null;
  }

  const handleSave = async () => {
    try {
      if (!filmSim?.id) {
        console.error("No film simulation ID available");
        return;
      }

      const updateInput = createUpdateInput();

      const result = await updateFilmSim({
        variables: {
          id: filmSim.id,
          input: updateInput,
        },
      });

      if (result.data?.updateFilmSim) {
        onSave?.(result.data.updateFilmSim);
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error("Error updating film simulation:", err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={window.innerWidth < 768}
      PaperProps={{
        sx: {
          backgroundColor: "background.paper",
          maxHeight: window.innerWidth < 768 ? "100vh" : "90vh",
          height: window.innerWidth < 768 ? "100vh" : "auto",
        },
      }}
    >
      <DialogTitle>Edit Film Simulation</DialogTitle>
      <DialogContent sx={{ overflowY: "auto", pb: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error updating film simulation: {error.message}
          </Alert>
        )}
        <Box component="form" sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Description"
              multiline
              minRows={3}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              fullWidth
            />

            <TextField
              label="Creator Notes"
              multiline
              minRows={3}
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              fullWidth
            />

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Tags (comma-separated)
              </Typography>
              <TextField
                fullWidth
                value={formData.tags}
                onChange={(e) => handleInputChange("tags", e.target.value)}
                placeholder="e.g., portrait, landscape, street"
                disabled
                helperText="Tag editing is not available in this version"
              />
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Compatible Cameras (comma-separated)
              </Typography>
              <TextField
                fullWidth
                value={formData.compatibleCameras}
                onChange={(e) =>
                  handleInputChange("compatibleCameras", e.target.value)
                }
                placeholder="e.g., X-T4, X-T5, X-H2"
              />
            </Box>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Film Simulation Type</InputLabel>
              <Select defaultValue={filmSim.type || "custom-recipe"} disabled>
                <MenuItem value="custom-recipe">Custom Recipe</MenuItem>
                <MenuItem value="fujifilm-native">Fujifilm Native</MenuItem>
              </Select>
            </FormControl>

            <FilmSimSettingsForm
              settings={formData.settings}
              onSettingChange={handleInputChange}
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pb: window.innerWidth < 768 ? 4 : 2 }}>
        <Button onClick={onClose} disabled={updating}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={updating}
          startIcon={updating ? <CircularProgress size={20} /> : null}
        >
          {updating ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditFilmSimDialog;
