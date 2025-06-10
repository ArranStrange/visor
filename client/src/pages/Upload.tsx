import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Box,
  Chip,
  InputLabel,
  OutlinedInput,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  Paper,
  Divider,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  SelectChangeEvent,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/CloudUpload";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import FilterIcon from "@mui/icons-material/Filter";
import InfoIcon from "@mui/icons-material/Info";
import WhiteBalanceGrid from "../components/WhiteBalanceGrid";

type UploadType = "preset" | "filmsim";

interface WhiteBalanceShift {
  r: number;
  b: number;
}

interface FilmSimSettings {
  dynamicRange: string;
  filmSimulation: string;
  whiteBalance: string;
  wbShift: WhiteBalanceShift;
  color: number;
  sharpness: number;
  highlight: number;
  shadow: number;
  noiseReduction: number;
  grainEffect: number;
  clarity: number;
}

const DYNAMIC_RANGE_OPTIONS = [
  { value: "AUTO", label: "Auto" },
  { value: "DR100", label: "DR100 (Normal)" },
  { value: "DR200", label: "DR200 (Expanded, min ISO 400)" },
  { value: "DR400", label: "DR400 (Max, min ISO 800)" },
];

const FILM_SIMULATION_OPTIONS = [
  { value: "PROVIA", label: "Provia (Standard)" },
  { value: "VELVIA", label: "Velvia (Vivid)" },
  { value: "ASTIA", label: "Astia (Soft)" },
  { value: "CLASSIC_CHROME", label: "Classic Chrome" },
  { value: "CLASSIC_NEG", label: "Classic Neg" },
  { value: "ETERNA", label: "Eterna" },
  { value: "ETERNA_BLEACH", label: "Eterna Bleach Bypass" },
  { value: "ACROS", label: "Acros" },
  { value: "MONOCHROME", label: "Monochrome" },
  { value: "SEPIA", label: "Sepia" },
  { value: "NOSTALGIC_NEG", label: "Nostalgic Neg" },
];

const WHITE_BALANCE_OPTIONS = [
  { value: "AUTO", label: "Auto" },
  { value: "DAYLIGHT", label: "Daylight" },
  { value: "SHADE", label: "Shade" },
  { value: "FLUORESCENT_1", label: "Fluorescent 1" },
  { value: "FLUORESCENT_2", label: "Fluorescent 2" },
  { value: "FLUORESCENT_3", label: "Fluorescent 3" },
  { value: "INCANDESCENT", label: "Incandescent" },
  { value: "UNDERWATER", label: "Underwater" },
  { value: "CUSTOM", label: "Custom" },
];

const TONE_OPTIONS = [
  { value: -2, label: "Soft" },
  { value: -1, label: "Medium Soft" },
  { value: 0, label: "Standard" },
  { value: 1, label: "Medium Hard" },
  { value: 2, label: "Hard" },
];

const COLOR_OPTIONS = [
  { value: -2, label: "Low (Desaturated)" },
  { value: -1, label: "Medium Low" },
  { value: 0, label: "Medium" },
  { value: 1, label: "Medium High" },
  { value: 2, label: "High (Rich Saturation)" },
];

const NOISE_REDUCTION_OPTIONS = [
  { value: -2, label: "Low" },
  { value: -1, label: "Medium Low" },
  { value: 0, label: "Medium" },
  { value: 1, label: "Medium High" },
  { value: 2, label: "High" },
];

const GRAIN_OPTIONS = [
  { value: -1, label: "Weak" },
  { value: 0, label: "Medium" },
  { value: 2, label: "Strong" },
];

const CLARITY_OPTIONS = [
  { value: -5, label: "Very Soft" },
  { value: -2, label: "Soft" },
  { value: 0, label: "Standard" },
  { value: 2, label: "Crisp" },
  { value: 5, label: "Very Punchy" },
];

const Upload: React.FC = () => {
  const [uploadType, setUploadType] = useState<UploadType>("preset");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [xmpFile, setXmpFile] = useState<File | null>(null);
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [cameraModel, setCameraModel] = useState("");
  const [filmType, setFilmType] = useState("");
  const [filmSettings, setFilmSettings] = useState<FilmSimSettings>({
    dynamicRange: "AUTO",
    filmSimulation: "PROVIA",
    whiteBalance: "AUTO",
    wbShift: { r: 0, b: 0 },
    color: 0,
    sharpness: 0,
    highlight: 0,
    shadow: 0,
    noiseReduction: 0,
    grainEffect: 0,
    clarity: 0,
  });

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim().toLowerCase())) {
        setTags([...tags, tagInput.trim().toLowerCase()]);
      }
      setTagInput("");
    }
  };

  const handleFilmSettingChange = (
    setting: keyof FilmSimSettings,
    value: string | number | WhiteBalanceShift
  ) => {
    setFilmSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("tags", JSON.stringify(tags));
    if (xmpFile) formData.append("xmp", xmpFile);
    if (beforeImage) formData.append("beforeImage", beforeImage);
    if (afterImage) formData.append("afterImage", afterImage);
    formData.append("notes", notes);

    if (uploadType === "filmsim") {
      formData.append("cameraModel", cameraModel);
      formData.append("filmType", filmType);
      formData.append("filmSettings", JSON.stringify(filmSettings));
    }

    console.log("Form submitted:", {
      uploadType,
      title,
      tags,
      xmpFile,
      beforeImage,
      afterImage,
      cameraModel,
      filmType,
      filmSettings,
    });
  };

  const renderSettingWithTooltip = (
    label: string,
    tooltip: string,
    value: string | number,
    options: { value: string | number; label: string }[],
    settingKey: keyof FilmSimSettings
  ) => (
    <Grid item xs={12} md={6}>
      <FormControl fullWidth>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography>{label}</Typography>
          <Tooltip title={tooltip}>
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Select
          value={value.toString()}
          onChange={(e: SelectChangeEvent<string>) => {
            const newValue = options.find(
              (opt) => opt.value.toString() === e.target.value
            )?.value;
            if (newValue !== undefined) {
              handleFilmSettingChange(settingKey, newValue);
            }
          }}
        >
          {options.map((option) => (
            <MenuItem
              key={option.value.toString()}
              value={option.value.toString()}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
  );

  const renderFilmSettings = () => (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Film Simulation Settings
      </Typography>
      <Stack spacing={3}>
        {renderSettingWithTooltip(
          "Dynamic Range",
          "Controls highlight preservation at the cost of ISO",
          filmSettings.dynamicRange,
          DYNAMIC_RANGE_OPTIONS,
          "dynamicRange"
        )}

        {renderSettingWithTooltip(
          "Film Simulation",
          "Sets the base look of the image",
          filmSettings.filmSimulation,
          FILM_SIMULATION_OPTIONS,
          "filmSimulation"
        )}

        {renderSettingWithTooltip(
          "White Balance",
          "Sets the baseline color temperature",
          filmSettings.whiteBalance,
          WHITE_BALANCE_OPTIONS,
          "whiteBalance"
        )}

        {renderSettingWithTooltip(
          "Color",
          "Adjusts saturation of color simulations",
          filmSettings.color,
          COLOR_OPTIONS,
          "color"
        )}

        {renderSettingWithTooltip(
          "Sharpness",
          "Affects edge definition — use lower for softer, more filmic look",
          filmSettings.sharpness,
          TONE_OPTIONS,
          "sharpness"
        )}

        {renderSettingWithTooltip(
          "Highlight Tone",
          "Controls how bright areas roll off — lower for softer highlights",
          filmSettings.highlight,
          TONE_OPTIONS,
          "highlight"
        )}

        {renderSettingWithTooltip(
          "Shadow Tone",
          "Controls how dark areas roll in — lower for more detail in shadows",
          filmSettings.shadow,
          TONE_OPTIONS,
          "shadow"
        )}

        {renderSettingWithTooltip(
          "Noise Reduction",
          "Affects grain smoothing at high ISO — lower = more visible grain",
          filmSettings.noiseReduction,
          NOISE_REDUCTION_OPTIONS,
          "noiseReduction"
        )}

        {renderSettingWithTooltip(
          "Grain Effect",
          "Simulated film grain overlay, mostly cosmetic",
          filmSettings.grainEffect,
          GRAIN_OPTIONS,
          "grainEffect"
        )}

        {renderSettingWithTooltip(
          "Clarity",
          "Microcontrast — can affect overall 'bite' and punch",
          filmSettings.clarity,
          CLARITY_OPTIONS,
          "clarity"
        )}

        {filmSettings.whiteBalance === "CUSTOM" && (
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              White Balance Shift
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Click on the grid to set the white balance shift. The center
              represents neutral (0,0).
            </Typography>
            <WhiteBalanceGrid
              value={filmSettings.wbShift}
              onChange={(value) => handleFilmSettingChange("wbShift", value)}
            />
          </Box>
        )}
      </Stack>
    </Paper>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 10 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Upload New {uploadType === "preset" ? "Preset" : "Film Simulation"}
      </Typography>

      <ToggleButtonGroup
        value={uploadType}
        exclusive
        onChange={(_, newType) => newType && setUploadType(newType)}
        sx={{ mb: 3 }}
      >
        <ToggleButton value="preset">
          <FilterIcon sx={{ mr: 1 }} />
          Preset
        </ToggleButton>
        <ToggleButton value="filmsim">
          <PhotoCameraIcon sx={{ mr: 1 }} />
          Film Simulation
        </ToggleButton>
      </ToggleButtonGroup>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3} mt={3}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <TextField
            label="Description"
            multiline
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {uploadType === "filmsim" && (
            <>
              <TextField
                label="Camera Model"
                value={cameraModel}
                onChange={(e) => setCameraModel(e.target.value)}
                required
              />
              <TextField
                label="Film Type"
                value={filmType}
                onChange={(e) => setFilmType(e.target.value)}
                required
              />
              {renderFilmSettings()}
            </>
          )}

          <Box>
            <InputLabel>Tags</InputLabel>
            <OutlinedInput
              placeholder="Type tag and press enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              fullWidth
            />
            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => setTags(tags.filter((t) => t !== tag))}
                />
              ))}
            </Stack>
          </Box>

          {uploadType === "preset" && (
            <Box>
              <InputLabel htmlFor="xmp-upload">.xmp Preset File</InputLabel>
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadIcon />}
                sx={{ mt: 1 }}
              >
                {xmpFile ? xmpFile.name : "Upload XMP"}
                <input
                  type="file"
                  accept=".xmp"
                  hidden
                  onChange={(e) => setXmpFile(e.target.files?.[0] || null)}
                />
              </Button>
            </Box>
          )}

          <Box>
            <InputLabel htmlFor="before-upload">Before Image</InputLabel>
            <Button component="label" variant="outlined" sx={{ mt: 1 }}>
              {beforeImage ? beforeImage.name : "Upload Before"}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setBeforeImage(e.target.files?.[0] || null)}
              />
            </Button>
          </Box>

          <Box>
            <InputLabel htmlFor="after-upload">After Image</InputLabel>
            <Button component="label" variant="outlined" sx={{ mt: 1 }}>
              {afterImage ? afterImage.name : "Upload After"}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setAfterImage(e.target.files?.[0] || null)}
              />
            </Button>
          </Box>

          <TextField
            label="Creator Notes"
            multiline
            minRows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Button variant="contained" type="submit" sx={{ mt: 2 }}>
            Submit {uploadType === "preset" ? "Preset" : "Film Simulation"}
          </Button>
        </Stack>
      </form>
    </Container>
  );
};

export default Upload;
