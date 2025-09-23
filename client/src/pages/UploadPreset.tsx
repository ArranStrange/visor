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
import WhiteBalanceGrid from "../components/settings/WhiteBalanceGrid";
import XmpParser from "../components/settings/XmpParser";
import XmpSettingsDisplay from "../components/settings/XmpSettingsDisplay";
import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import ToneCurve from "../components/settings/ToneCurve";
import { useNavigate } from "react-router-dom";
import type { GridProps } from "@mui/material";
import {
  PresetSettings,
  ToneCurve as ToneCurveType,
  UploadPresetInput,
} from "../types/graphql";
import SettingSliderDisplay from "../components/forms/SettingSliderDisplay";
import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";

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
    $beforeImage: ImageInput
    $afterImage: ImageInput
    $sampleImages: [ImageInput!]
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
      sampleImages: $sampleImages
    ) {
      id
      title
      slug
      description
      settings {
        exposure
        contrast
        highlights
        shadows
        whites
        blacks
        temp
        tint
        vibrance
        saturation
        clarity
        dehaze
        grain {
          amount
          size
          roughness
        }
        vignette {
          amount
        }
        colorAdjustments {
          red {
            hue
            saturation
            luminance
          }
          orange {
            saturation
            luminance
          }
          yellow {
            hue
            saturation
            luminance
          }
          green {
            hue
            saturation
          }
          blue {
            hue
            saturation
          }
        }
        splitToning {
          shadowHue
          shadowSaturation
          highlightHue
          highlightSaturation
          balance
        }
        sharpening
        noiseReduction {
          luminance
          detail
          color
        }
      }
      toneCurve {
        rgb {
          x
          y
        }
        red {
          x
          y
        }
        green {
          x
          y
        }
        blue {
          x
          y
        }
      }
      notes
      tags {
        id
        name
        displayName
      }
      beforeImage {
        id
        url
        publicId
      }
      afterImage {
        id
        url
        publicId
      }
      sampleImages {
        id
        url
        publicId
        caption
      }
      creator {
        id
        username
        avatar
        instagram
      }
      createdAt
      updatedAt
    }
  }
`;

// Constants for file validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Type declarations for environment variables
declare global {
  interface ImportMeta {
    env: {
      VITE_CLOUDINARY_CLOUD_NAME: string;
      VITE_CLOUDINARY_API_KEY: string;
      VITE_CLOUDINARY_API_SECRET: string;
    };
  }
}

// Cloudinary configuration
const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
  apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
};

interface ImageInput {
  publicId: string;
  url: string;
}

// Interface matching the XMP parser output format
// Import the comprehensive ParsedSettings interface from XmpParser
import { ParsedSettings } from "../components/settings/XmpParser";

const UploadPreset: React.FC = () => {
  const [uploadType, setUploadType] = useState<UploadType>("preset");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [parsedSettings, setParsedSettings] = useState<ParsedSettings | null>(
    null
  );
  const [uploadPreset, { loading: uploadLoading }] = useMutation(UPLOAD_PRESET);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadedBeforeImage, setUploadedBeforeImage] =
    useState<ImageInput | null>(null);
  const [uploadedAfterImage, setUploadedAfterImage] =
    useState<ImageInput | null>(null);

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

  const uploadToCloudinary = async (file: File): Promise<ImageInput> => {
    console.log("Uploading to Cloudinary...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "PresetBeforeAndAfter");
    formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Cloudinary upload error:", errorData);
        throw new Error(
          `Failed to upload image to Cloudinary: ${
            errorData.error?.message || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      console.log("Cloudinary upload response:", data);

      return {
        publicId: data.public_id,
        url: data.secure_url,
      };
    } catch (error: any) {
      console.error("Error uploading to Cloudinary:", error);
      throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
    }
  };

  const handleBeforeImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setBeforeImage(file);
      try {
        setIsUploading(true);
        const result = await uploadToCloudinary(file);
        setUploadedBeforeImage(result);
      } catch (error) {
        setFileError("Failed to upload before image to Cloudinary");
        console.error("Error uploading before image:", error);
      } finally {
        setIsUploading(false);
      }
    } else {
      e.target.value = ""; // Reset the input
    }
  };

  const handleAfterImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setAfterImage(file);
      try {
        setIsUploading(true);
        const result = await uploadToCloudinary(file);
        setUploadedAfterImage(result);
      } catch (error) {
        setFileError("Failed to upload after image to Cloudinary");
        console.error("Error uploading after image:", error);
      } finally {
        setIsUploading(false);
      }
    } else {
      e.target.value = ""; // Reset the input
    }
  };

  const handleSettingsParsed = (settings: ParsedSettings) => {
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
  const buildSettingsForBackend = (parsed: ParsedSettings): PresetSettings => ({
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
      amount: Number(parsed.effects?.grainAmount) || 0,
      size: Number(parsed.effects?.grainSize) || 0,
      roughness: Number(parsed.effects?.grainFrequency) || 0, // Map frequency to roughness
    },
    vignette: {
      amount: Number(parsed.effects?.postCropVignetteAmount) || 0,
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

    // Detail - map texture to sharpening
    sharpening: Number(parsed.texture) || 0,
    noiseReduction: {
      luminance: Number(parsed.detail?.luminanceSmoothing) || 0,
      detail: Number(parsed.detail?.luminanceDetail) || 0,
      color: Number(parsed.detail?.colorNoiseReduction) || 0,
    },
  });

  const buildToneCurveForBackend = (parsed: ParsedSettings): ToneCurveType => {
    if (!parsed.toneCurve) {
      return {
        rgb: [
          { x: 0, y: 0 },
          { x: 255, y: 255 },
        ],
        red: [
          { x: 0, y: 0 },
          { x: 255, y: 255 },
        ],
        green: [
          { x: 0, y: 0 },
          { x: 255, y: 255 },
        ],
        blue: [
          { x: 0, y: 0 },
          { x: 255, y: 255 },
        ],
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
    if (!parsedSettings) {
      setError("Please upload an XMP file first");
      return;
    }

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (tags.length === 0) {
      setError("At least one tag is required");
      return;
    }

    if (!uploadedBeforeImage || !uploadedAfterImage) {
      setError("Both before and after images are required");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const settings = buildSettingsForBackend(parsedSettings);
      const toneCurve = buildToneCurveForBackend(parsedSettings);

      console.log("Settings being sent:", JSON.stringify(settings, null, 2));
      console.log("Tone curve being sent:", JSON.stringify(toneCurve, null, 2));

      // Extract colorGrading from settings to send as separate field
      const { colorGrading, ...settingsWithoutColorGrading } = settings;

      const variables = {
        title,
        description,
        settings: settingsWithoutColorGrading,
        toneCurve,
        colorGrading,
        notes,
        tags: tags.map((tag) => tag.toLowerCase()),
        beforeImage: uploadedBeforeImage,
        afterImage: uploadedAfterImage,
        sampleImages: [],
      };

      console.log(
        "Uploading with variables:",
        JSON.stringify(variables, null, 2)
      );

      const result = await uploadPreset({
        variables,
      });

      console.log("Upload result:", result);

      if (result.errors) {
        console.error("GraphQL Errors:", result.errors);
        throw new Error(result.errors[0].message);
      }

      if (!result.data?.uploadPreset) {
        console.error("No data returned from server");
        throw new Error("Failed to upload preset: No data returned");
      }

      navigate(`/preset/${result.data.uploadPreset.slug}`);
    } catch (error: any) {
      console.error("Error uploading:", error);
      setError(error.message || "Failed to upload preset");
    } finally {
      setIsUploading(false);
    }
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

            {/* Display Parsed Settings */}
            {parsedSettings && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Parsed Settings Preview
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Preview of the settings that will be applied from the XMP
                  file:
                </Typography>
                <XmpSettingsDisplay settings={parsedSettings} />
              </Box>
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
