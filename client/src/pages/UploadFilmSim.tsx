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
  FormControl,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
} from "@mui/material";
import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import WhiteBalanceGrid from "../components/WhiteBalanceGrid";
import { WhiteBalanceShift } from "../components/WhiteBalanceGrid";
import DeleteIcon from "@mui/icons-material/Delete";

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

const UPLOAD_FILM_SIM = gql`
  mutation UploadFilmSim(
    $name: String!
    $description: String
    $settings: FilmSimSettingsInput!
    $notes: String
    $tags: [String!]!
    $sampleImages: [Upload!]
  ) {
    uploadFilmSim(
      name: $name
      description: $description
      settings: $settings
      notes: $notes
      tags: $tags
      sampleImages: $sampleImages
    ) {
      id
      name
      slug
    }
  }
`;

// Constants for file validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const DYNAMIC_RANGE_MAP = {
  AUTO: 0,
  DR100: 100,
  DR200: 200,
  DR400: 400,
};

const FILM_SIMULATION_MAP = {
  PROVIA: 0,
  VELVIA: 1,
  ASTIA: 2,
  CLASSIC_CHROME: 3,
  CLASSIC_NEG: 4,
  ETERNA: 5,
  ETERNA_BLEACH: 6,
  ACROS: 7,
  MONOCHROME: 8,
  SEPIA: 9,
  NOSTALGIC_NEG: 10,
};

const WHITE_BALANCE_MAP = {
  AUTO: 0,
  DAYLIGHT: 1,
  SHADE: 2,
  FLUORESCENT_1: 3,
  FLUORESCENT_2: 4,
  FLUORESCENT_3: 5,
  INCANDESCENT: 6,
  UNDERWATER: 7,
  CUSTOM: 8,
};

const UploadFilmSim: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [sampleImages, setSampleImages] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
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
  const [uploadFilmSim, { loading: uploadLoading }] =
    useMutation(UPLOAD_FILM_SIM);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

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

  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      setFileError(
        `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
      );
      return false;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFileError("File must be a JPEG, PNG, or WebP image");
      return false;
    }
    return true;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const files = Array.from(e.target.files || []);

    // Validate all files
    const validFiles = files.filter((file) => validateFile(file));

    if (validFiles.length > 0) {
      setSampleImages((prev) => [...prev, ...validFiles]);
    }

    // Reset the input
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setSampleImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFileError(null);

    try {
      // Validate required fields
      if (!title.trim()) {
        setError("Name is required");
        return;
      }
      if (!tags.length) {
        setError("Please add at least one tag");
        return;
      }

      setIsUploading(true);

      // Format settings to match FilmSimSettingsInput type
      const formattedSettings = {
        dynamicRange: filmSettings.dynamicRange,
        filmSimulation: filmSettings.filmSimulation,
        whiteBalance: filmSettings.whiteBalance,
        wbShift: {
          r: Math.round(filmSettings.wbShift.r) || 0,
          b: Math.round(filmSettings.wbShift.b) || 0,
        },
        color: Math.round(filmSettings.color) || 0,
        sharpness: Math.round(filmSettings.sharpness) || 0,
        highlight: Math.round(filmSettings.highlight) || 0,
        shadow: Math.round(filmSettings.shadow) || 0,
        noiseReduction: Math.round(filmSettings.noiseReduction) || 0,
        grainEffect: Math.round(filmSettings.grainEffect) || 0,
        clarity: Math.round(filmSettings.clarity) || 0,
      };

      // Prepare variables for the film sim mutation
      const variables = {
        name: title,
        description,
        settings: formattedSettings,
        notes,
        tags: tags.map((tag) => tag.toLowerCase()),
        sampleImages: sampleImages,
      };

      console.log("Uploading with variables:", variables);

      const result = await uploadFilmSim({
        variables,
      });

      console.log("Upload result:", result);

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      if (!result.data?.uploadFilmSim) {
        throw new Error("Failed to upload film simulation");
      }

      navigate(`/filmsim/${result.data.uploadFilmSim.slug}`);
    } catch (err) {
      console.error("Error uploading:", err);
      setError(err instanceof Error ? err.message : "Failed to upload");
    } finally {
      setIsUploading(false);
    }
  };

  const renderSettingWithTooltip = (
    label: string,
    tooltip: string,
    value: string | number,
    options: { value: string | number; label: string }[],
    settingKey: keyof FilmSimSettings
  ) => (
    <Grid {...(undefined as any)} item xs={12} md={6}>
      <FormControl fullWidth>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography>{label}</Typography>
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Upload Film Simulation
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {fileError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {fileError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3} mt={3}>
            <TextField
              label="Name"
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

            {renderFilmSettings()}

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Tags
              </Typography>
              <FormControl fullWidth>
                <OutlinedInput
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add tags (press Enter)"
                  endAdornment={
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          onDelete={() =>
                            setTags(tags.filter((t) => t !== tag))
                          }
                          size="small"
                        />
                      ))}
                    </Box>
                  }
                />
              </FormControl>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Sample Images
              </Typography>
              <Button component="label" variant="outlined" sx={{ mt: 1 }}>
                Add Images
                <input
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  onChange={handleImageChange}
                  multiple
                  style={{ display: "none" }}
                />
              </Button>
              {sampleImages.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    {sampleImages.map((file, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
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
                            src={URL.createObjectURL(file)}
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
                            onClick={() => removeImage(index)}
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
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>

            <TextField
              label="Creator Notes"
              multiline
              minRows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isUploading}
                startIcon={isUploading ? <CircularProgress size={20} /> : null}
              >
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default UploadFilmSim;
