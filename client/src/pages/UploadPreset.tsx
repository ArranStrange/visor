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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/CloudUpload";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import FilterIcon from "@mui/icons-material/Filter";
import InfoIcon from "@mui/icons-material/Info";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WhiteBalanceGrid from "../components/WhiteBalanceGrid";
import XmpParser from "../components/XmpParser";
import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import ToneCurve from "../components/ToneCurve";
import { useNavigate } from "react-router-dom";
import type { GridProps } from "@mui/material";
import {
  PresetSettings,
  ToneCurve as ToneCurveType,
  UploadPresetInput,
} from "../types/graphql";
import SettingSliderDisplay from "../components/SettingSliderDisplay";

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

const UPLOAD_PRESET = gql`
  mutation UploadPreset(
    $title: String!
    $description: String
    $settings: PresetSettingsInput!
    $toneCurve: ToneCurveInput
    $notes: String
    $tags: [String!]!
    $beforeImage: Upload
    $afterImage: Upload
  ) {
    uploadPreset(
      title: $title
      description: $description
      settings: $settings
      toneCurve: $toneCurve
      notes: $notes
      tags: $tags
      beforeImage: $beforeImage
      afterImage: $afterImage
    ) {
      id
      title
      slug
    }
  }
`;

const UPLOAD_FILMSIM = gql`
  mutation UploadFilmSim(
    $title: String!
    $description: String
    $settings: JSON!
    $notes: String
    $tags: [String!]!
    $cameraModel: String!
    $filmType: String!
    $beforeImage: Upload
    $afterImage: Upload
  ) {
    uploadFilmSim(
      title: $title
      description: $description
      settings: $settings
      notes: $notes
      tags: $tags
      cameraModel: $cameraModel
      filmType: $filmType
      beforeImage: $beforeImage
      afterImage: $afterImage
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

const UploadPreset: React.FC = () => {
  const [uploadType, setUploadType] = useState<UploadType>("preset");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [parsedSettings, setParsedSettings] = useState<PresetSettings | null>(
    null
  );
  const [uploadPreset, { loading: uploadLoading }] = useMutation(UPLOAD_PRESET);
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

  const handleBeforeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setBeforeImage(file);
    } else {
      e.target.value = ""; // Reset the input
    }
  };

  const handleAfterImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setAfterImage(file);
    } else {
      e.target.value = ""; // Reset the input
    }
  };

  const handleSettingsParsed = (settings: any) => {
    if (!settings || typeof settings !== "object") {
      setError("Invalid settings format received from XMP parser");
      return;
    }
    setParsedSettings(settings);
  };

  const formatToneCurveData = (data: any) => {
    if (!data)
      return {
        rgb: [0, 64, 128, 192, 255],
        red: [0, 64, 128, 192, 255],
        green: [0, 64, 128, 192, 255],
        blue: [0, 64, 128, 192, 255],
      };

    // Convert x,y coordinates to output values
    const inputPoints = [0, 64, 128, 192, 255];
    const formatCurve = (curve: Array<{ x: number; y: number }>) => {
      if (!curve || !Array.isArray(curve)) return inputPoints;

      return inputPoints.map((input) => {
        // Find the two points that surround this input value
        const lowerPoint = curve.reduce<{ x: number; y: number } | null>(
          (prev, curr) => {
            return curr.x <= input && (!prev || curr.x > prev.x) ? curr : prev;
          },
          null as { x: number; y: number } | null
        );

        const upperPoint = curve.reduce<{ x: number; y: number } | null>(
          (prev, curr) => {
            return curr.x >= input && (!prev || curr.x < prev.x) ? curr : prev;
          },
          null as { x: number; y: number } | null
        );

        if (!lowerPoint || !upperPoint) return input;
        if (lowerPoint.x === upperPoint.x) return lowerPoint.y;

        // Linear interpolation between points
        const ratio = (input - lowerPoint.x) / (upperPoint.x - lowerPoint.x);
        return Math.round(lowerPoint.y + ratio * (upperPoint.y - lowerPoint.y));
      });
    };

    return {
      rgb: formatCurve(data.rgb),
      red: formatCurve(data.red),
      green: formatCurve(data.green),
      blue: formatCurve(data.blue),
    };
  };

  // Helper to map parsedSettings to backend expected structure
  const buildSettingsForBackend = (parsed: any): PresetSettings => ({
    // Light settings
    exposure: Number(parsed.exposure) || 0,
    contrast: Number(parsed.contrast) || 0,
    highlights: Number(parsed.highlights) || 0,
    shadows: Number(parsed.shadows) || 0,
    whites: Number(parsed.whites) || 0,
    blacks: Number(parsed.blacks) || 0,
    // Color settings
    temp: Number(parsed.temp) || 0,
    tint: Number(parsed.tint) || 0,
    vibrance: Number(parsed.vibrance) || 0,
    saturation: Number(parsed.saturation) || 0,
    // Effects
    clarity: Number(parsed.clarity) || 0,
    dehaze: Number(parsed.dehaze) || 0,
    grain: {
      amount: Number(parsed.grain?.amount) || 0,
      size: Number(parsed.grain?.size) || 0,
      roughness: Number(parsed.grain?.roughness) || 0,
    },
    vignette: {
      amount: Number(parsed.vignette?.amount) || 0,
    },
    colorAdjustments: {
      red: {
        hue: Number(parsed.colorAdjustments?.red?.hue) || 0,
        saturation: Number(parsed.colorAdjustments?.red?.saturation) || 0,
        luminance: Number(parsed.colorAdjustments?.red?.luminance) || 0,
      },
      orange: {
        saturation: Number(parsed.colorAdjustments?.orange?.saturation) || 0,
        luminance: Number(parsed.colorAdjustments?.orange?.luminance) || 0,
      },
      yellow: {
        hue: Number(parsed.colorAdjustments?.yellow?.hue) || 0,
        saturation: Number(parsed.colorAdjustments?.yellow?.saturation) || 0,
        luminance: Number(parsed.colorAdjustments?.yellow?.luminance) || 0,
      },
      green: {
        hue: Number(parsed.colorAdjustments?.green?.hue) || 0,
        saturation: Number(parsed.colorAdjustments?.green?.saturation) || 0,
      },
      blue: {
        hue: Number(parsed.colorAdjustments?.blue?.hue) || 0,
        saturation: Number(parsed.colorAdjustments?.blue?.saturation) || 0,
      },
    },
    splitToning: {
      shadowHue: Number(parsed.splitToning?.shadowHue) || 0,
      shadowSaturation: Number(parsed.splitToning?.shadowSaturation) || 0,
      highlightHue: Number(parsed.splitToning?.highlightHue) || 0,
      highlightSaturation: Number(parsed.splitToning?.highlightSaturation) || 0,
      balance: Number(parsed.splitToning?.balance) || 0,
    },
    // Detail
    sharpening: Number(parsed.sharpening) || 0,
    noiseReduction: {
      luminance: Number(parsed.noiseReduction?.luminance) || 0,
      detail: Number(parsed.noiseReduction?.detail) || 0,
      color: Number(parsed.noiseReduction?.color) || 0,
    },
  });

  const buildToneCurveForBackend = (parsed: any): ToneCurveType => {
    if (!parsed.toneCurve) {
      return {
        rgb: [],
        red: [],
        green: [],
        blue: [],
      };
    }

    const ensureValidPoints = (points: any[] | undefined) => {
      if (!points || !Array.isArray(points)) return [];
      return points
        .map((point) => ({
          x: Number(point.x) || 0,
          y: Number(point.y) || 0,
        }))
        .filter((point) => !isNaN(point.x) && !isNaN(point.y));
    };

    return {
      rgb: ensureValidPoints(parsed.toneCurve.rgb),
      red: ensureValidPoints(parsed.toneCurve.red),
      green: ensureValidPoints(parsed.toneCurve.green),
      blue: ensureValidPoints(parsed.toneCurve.blue),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFileError(null);

    try {
      // Validate required fields
      if (!title.trim()) {
        setError("Title is required");
        return;
      }
      if (!tags.length) {
        setError("Please add at least one tag");
        return;
      }
      if (!parsedSettings) {
        setError("Please upload and parse an XMP file");
        return;
      }

      setIsUploading(true);

      // Prepare variables for the preset mutation
      const variables: UploadPresetInput = {
        title,
        description,
        settings: buildSettingsForBackend(parsedSettings),
        toneCurve: buildToneCurveForBackend(parsedSettings),
        notes,
        tags: tags.map((tag) => tag.toLowerCase()),
        // No images for now
      };

      console.log("Uploading with variables:", variables);

      const result = await uploadPreset({
        variables,
      });

      console.log("Upload result:", result);
      navigate(`/preset/${result.data.uploadPreset.slug}`);
    } catch (err: any) {
      console.error("Error uploading:", err);
      if (err.graphQLErrors) {
        console.error("GraphQL Errors:", err.graphQLErrors);
      }
      if (err.networkError) {
        console.error("Network Error:", err.networkError);
      }
      setError(err instanceof Error ? err.message : "Failed to upload");
    } finally {
      setIsUploading(false);
    }
  };

  const formatSettingValue = (value: number) => {
    return value.toFixed(1);
  };

  const parseSettingValue = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const renderAccordionSection = (
    title: string,
    settings: string[],
    customContent?: React.ReactNode
  ) => {
    if (!parsedSettings) return null;

    const hasSettings = settings.some(
      (setting) => parsedSettings[setting] !== undefined
    );
    const hasCustomContent = !!customContent;

    if (!hasSettings && !hasCustomContent) return null;

    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{title}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {settings.map((setting) => {
            if (parsedSettings[setting] === undefined) return null;
            return (
              <SettingSliderDisplay
                key={setting}
                label={setting.charAt(0).toUpperCase() + setting.slice(1)}
                value={formatSettingValue(parsedSettings[setting])}
              />
            );
          })}
          {customContent}
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Upload Preset
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

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                XMP File
              </Typography>
              <XmpParser onSettingsParsed={handleSettingsParsed} />
            </Box>

            {parsedSettings && (
              <>
                {renderAccordionSection("Light", [
                  "exposure",
                  "contrast",
                  "highlights",
                  "shadows",
                  "whites",
                  "blacks",
                ])}

                {renderAccordionSection("Color", [
                  "temp",
                  "tint",
                  "vibrance",
                  "saturation",
                ])}

                {renderAccordionSection("Effects", ["clarity", "dehaze"])}

                {renderAccordionSection(
                  "Grain",
                  [],
                  <Box>
                    {parsedSettings.grain && (
                      <>
                        <SettingSliderDisplay
                          label="Amount"
                          value={formatSettingValue(
                            parsedSettings.grain.amount / 100
                          )}
                        />
                        <SettingSliderDisplay
                          label="Size"
                          value={formatSettingValue(
                            parsedSettings.grain.size / 100
                          )}
                        />
                        <SettingSliderDisplay
                          label="Roughness"
                          value={formatSettingValue(
                            parsedSettings.grain.roughness / 100
                          )}
                        />
                      </>
                    )}
                  </Box>
                )}

                {renderAccordionSection(
                  "Noise Reduction",
                  [],
                  <Box>
                    {parsedSettings.noiseReduction && (
                      <>
                        <SettingSliderDisplay
                          label="Luminance"
                          value={formatSettingValue(
                            parsedSettings.noiseReduction.luminance / 100
                          )}
                        />
                        <SettingSliderDisplay
                          label="Color"
                          value={formatSettingValue(
                            parsedSettings.noiseReduction.color / 100
                          )}
                        />
                        <SettingSliderDisplay
                          label="Detail"
                          value={formatSettingValue(
                            parsedSettings.noiseReduction.detail / 100
                          )}
                        />
                      </>
                    )}
                  </Box>
                )}

                {renderAccordionSection("Detail", ["sharpening"])}
              </>
            )}

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
              <InputLabel htmlFor="before-upload">Before Image</InputLabel>
              <Button component="label" variant="outlined" sx={{ mt: 1 }}>
                {beforeImage ? beforeImage.name : "Upload Before"}
                <input
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  onChange={handleBeforeImageChange}
                  style={{ display: "none" }}
                  id="before-image-input"
                />
              </Button>
            </Box>

            <Box>
              <InputLabel htmlFor="after-upload">After Image</InputLabel>
              <Button component="label" variant="outlined" sx={{ mt: 1 }}>
                {afterImage ? afterImage.name : "Upload After"}
                <input
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  onChange={handleAfterImageChange}
                  style={{ display: "none" }}
                  id="after-image-input"
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

export default UploadPreset;
