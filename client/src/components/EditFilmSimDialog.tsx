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
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Grid,
  SelectChangeEvent,
} from "@mui/material";
import { useMutation } from "@apollo/client";
import { UPDATE_FILMSIM } from "../graphql/mutations/updateFilmSim";
import WhiteBalanceGrid from "./WhiteBalanceGrid";
import { WhiteBalanceShift } from "./WhiteBalanceGrid";
import {
  DYNAMIC_RANGE_OPTIONS,
  FILM_SIMULATION_OPTIONS,
  WHITE_BALANCE_OPTIONS,
  TONE_SLIDER_OPTIONS,
  COLOR_OPTIONS,
  NOISE_REDUCTION_OPTIONS,
  GRAIN_EFFECT_OPTIONS,
  CLARITY_OPTIONS,
  COLOR_CHROME_EFFECT_OPTIONS,
  COLOR_CHROME_FX_BLUE_OPTIONS,
} from "../data/filmSimSettings";

interface FilmSimSettings {
  filmSimulation?: string;
  dynamicRange?: number | null;
  highlight?: number;
  shadow?: number;
  color?: number;
  sharpness?: number;
  noiseReduction?: number;
  grainEffect?: string;
  clarity?: number;
  whiteBalance?: string;
  wbShift?: WhiteBalanceShift;
  colorChromeEffect?: string;
  colorChromeFxBlue?: string;
}

interface FilmSimData {
  id: string;
  name: string;
  description?: string;
  notes?: string;
  type?: string;
  tags?: { displayName: string }[];
  compatibleCameras?: string[];
  settings?: FilmSimSettings;
}

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

  const renderSettingWithTooltip = (
    label: string,
    _tooltip: string,
    value: string | number | null,
    options: { value: string | number | null; label: string }[],
    settingKey: keyof FilmSimSettings
  ) => (
    <Grid {...(undefined as any)} item xs={12} md={6}>
      <FormControl fullWidth>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography>{label}</Typography>
        </Box>
        <Select
          value={value === null ? "null" : value.toString()}
          onChange={(e: SelectChangeEvent<string>) => {
            const newValue = options.find(
              (opt) =>
                (opt.value === null ? "null" : opt.value.toString()) ===
                e.target.value
            )?.value;
            if (newValue !== undefined) {
              handleInputChange(`settings.${settingKey}`, newValue);
            }
          }}
        >
          {options.map((option) => (
            <MenuItem
              key={option.value === null ? "null" : option.value.toString()}
              value={option.value === null ? "null" : option.value.toString()}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
  );

  // Don't render if filmSim is invalid
  if (!filmSim || !filmSim.id) {
    return null;
  }

  // Form state
  const [formData, setFormData] = React.useState({
    name: filmSim.name || "",
    description: filmSim.description || "",
    notes: filmSim.notes || "",
    tags:
      filmSim.tags
        ?.filter((tag: any) => tag && tag.displayName)
        .map((tag) => tag?.displayName || "Unknown")
        .join(", ") || "",
    compatibleCameras: filmSim.compatibleCameras?.join(", ") || "",
    settings: {
      filmSimulation: filmSim.settings?.filmSimulation || "PROVIA",
      dynamicRange: filmSim.settings?.dynamicRange || null,
      highlight: filmSim.settings?.highlight || 0,
      shadow: filmSim.settings?.shadow || 0,
      color: filmSim.settings?.color || 0,
      sharpness: filmSim.settings?.sharpness || 0,
      noiseReduction: filmSim.settings?.noiseReduction || 0,
      grainEffect: filmSim.settings?.grainEffect || "OFF",
      clarity: filmSim.settings?.clarity || 0,
      whiteBalance: filmSim.settings?.whiteBalance || "AUTO",
      wbShift: filmSim.settings?.wbShift || { r: 0, b: 0 },
      colorChromeEffect: filmSim.settings?.colorChromeEffect || "OFF",
      colorChromeFxBlue: filmSim.settings?.colorChromeFxBlue || "OFF",
    },
  });

  React.useEffect(() => {
    setFormData({
      name: filmSim.name || "",
      description: filmSim.description || "",
      notes: filmSim.notes || "",
      tags:
        filmSim.tags
          ?.filter((tag: any) => tag && tag.displayName)
          .map((tag) => tag?.displayName || "Unknown")
          .join(", ") || "",
      compatibleCameras: filmSim.compatibleCameras?.join(", ") || "",
      settings: {
        filmSimulation: filmSim.settings?.filmSimulation || "PROVIA",
        dynamicRange: filmSim.settings?.dynamicRange || null,
        highlight: filmSim.settings?.highlight || 0,
        shadow: filmSim.settings?.shadow || 0,
        color: filmSim.settings?.color || 0,
        sharpness: filmSim.settings?.sharpness || 0,
        noiseReduction: filmSim.settings?.noiseReduction || 0,
        grainEffect: filmSim.settings?.grainEffect || "OFF",
        clarity: filmSim.settings?.clarity || 0,
        whiteBalance: filmSim.settings?.whiteBalance || "AUTO",
        wbShift: filmSim.settings?.wbShift || { r: 0, b: 0 },
        colorChromeEffect: filmSim.settings?.colorChromeEffect || "OFF",
        colorChromeFxBlue: filmSim.settings?.colorChromeFxBlue || "OFF",
      },
    });
  }, [filmSim]);

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith("settings.")) {
      const settingKey = field.replace("settings.", "");
      setFormData((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingKey]: value,
        },
      }));
    } else if (field.startsWith("settings.wbShift.")) {
      const wbKey = field.replace("settings.wbShift.", "");
      setFormData((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          wbShift: {
            ...prev.settings.wbShift,
            [wbKey]: parseInt(value) || 0,
          },
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = async () => {
    try {
      if (!filmSim?.id) {
        console.error("No film simulation ID available");
        return;
      }

      const updateInput = {
        name: formData.name,
        description: formData.description,
        notes: formData.notes,
        compatibleCameras: formData.compatibleCameras
          .split(",")
          .map((camera) => camera.trim())
          .filter((camera) => camera),
        settings: {
          dynamicRange: formData.settings.dynamicRange,
          filmSimulation: formData.settings.filmSimulation,
          whiteBalance: formData.settings.whiteBalance,
          wbShift: {
            r: Math.round(formData.settings.wbShift.r) || 0,
            b: Math.round(formData.settings.wbShift.b) || 0,
          },
          color: Math.round(formData.settings.color) || 0,
          sharpness: Math.round(formData.settings.sharpness) || 0,
          highlight: Math.round(formData.settings.highlight) || 0,
          shadow: Math.round(formData.settings.shadow) || 0,
          noiseReduction: Math.round(formData.settings.noiseReduction) || 0,
          grainEffect: formData.settings.grainEffect,
          clarity: Math.round(formData.settings.clarity) || 0,
          colorChromeEffect: formData.settings.colorChromeEffect,
          colorChromeFxBlue: formData.settings.colorChromeFxBlue,
        },
      };

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

            <Paper sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Film Simulation Settings
              </Typography>
              <Stack spacing={3}>
                <Grid container spacing={2}>
                  {renderSettingWithTooltip(
                    "Dynamic Range",
                    "Controls highlight preservation at the cost of ISO",
                    formData.settings.dynamicRange,
                    DYNAMIC_RANGE_OPTIONS,
                    "dynamicRange"
                  )}

                  {renderSettingWithTooltip(
                    "Film Simulation",
                    "Sets the base look of the image",
                    formData.settings.filmSimulation,
                    FILM_SIMULATION_OPTIONS,
                    "filmSimulation"
                  )}

                  {renderSettingWithTooltip(
                    "White Balance",
                    "Sets the baseline color temperature",
                    formData.settings.whiteBalance,
                    WHITE_BALANCE_OPTIONS,
                    "whiteBalance"
                  )}

                  {renderSettingWithTooltip(
                    "Color",
                    "Adjusts saturation of color simulations",
                    formData.settings.color,
                    COLOR_OPTIONS,
                    "color"
                  )}

                  {renderSettingWithTooltip(
                    "Sharpness",
                    "Affects edge definition — use lower for softer, more filmic look",
                    formData.settings.sharpness,
                    TONE_SLIDER_OPTIONS,
                    "sharpness"
                  )}

                  {renderSettingWithTooltip(
                    "Highlight Tone",
                    "Controls how bright areas roll off — lower for softer highlights",
                    formData.settings.highlight,
                    TONE_SLIDER_OPTIONS,
                    "highlight"
                  )}

                  {renderSettingWithTooltip(
                    "Shadow Tone",
                    "Controls how dark areas roll in — lower for more detail in shadows",
                    formData.settings.shadow,
                    TONE_SLIDER_OPTIONS,
                    "shadow"
                  )}

                  {renderSettingWithTooltip(
                    "Noise Reduction",
                    "Affects grain smoothing at high ISO — lower = more visible grain",
                    formData.settings.noiseReduction,
                    NOISE_REDUCTION_OPTIONS,
                    "noiseReduction"
                  )}

                  {renderSettingWithTooltip(
                    "Grain Effect",
                    "Simulated film grain overlay, mostly cosmetic",
                    formData.settings.grainEffect,
                    GRAIN_EFFECT_OPTIONS,
                    "grainEffect"
                  )}

                  {renderSettingWithTooltip(
                    "Clarity",
                    "Microcontrast — can affect overall 'bite' and punch",
                    formData.settings.clarity,
                    CLARITY_OPTIONS,
                    "clarity"
                  )}

                  {renderSettingWithTooltip(
                    "Color Chrome Effect",
                    "Enhances color separation and depth",
                    formData.settings.colorChromeEffect,
                    COLOR_CHROME_EFFECT_OPTIONS,
                    "colorChromeEffect"
                  )}

                  {renderSettingWithTooltip(
                    "Color Chrome FX Blue",
                    "Enhances blue color separation",
                    formData.settings.colorChromeFxBlue,
                    COLOR_CHROME_FX_BLUE_OPTIONS,
                    "colorChromeFxBlue"
                  )}

                  <Box sx={{ mt: 3, mb: 2, width: "100%" }}>
                    <Typography variant="subtitle2" gutterBottom>
                      White Balance Shift
                    </Typography>
                    <WhiteBalanceGrid
                      value={formData.settings.wbShift}
                      onChange={(value) =>
                        handleInputChange("settings.wbShift", value)
                      }
                    />
                  </Box>
                </Grid>
              </Stack>
            </Paper>
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
