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
    $settings: JSON!
    $notes: String
    $tags: [String!]!
    $toneCurve: JSON!
    $beforeImage: Upload
    $afterImage: Upload
  ) {
    uploadPreset(
      title: $title
      description: $description
      settings: $settings
      notes: $notes
      tags: $tags
      toneCurve: $toneCurve
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
  const [parsedSettings, setParsedSettings] = useState<any>(null);
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
      const variables: any = {
        title,
        description,
        settings: parsedSettings.settings,
        notes,
        tags: tags.map((tag) => tag.toLowerCase()),
        toneCurve: formatToneCurveData(parsedSettings.toneCurve),
      };

      // Only include files if they exist
      if (beforeImage) {
        variables.beforeImage = beforeImage;
      }
      if (afterImage) {
        variables.afterImage = afterImage;
      }

      const result = await uploadPreset({
        variables,
      });

      console.log("Upload result:", result);
      navigate(`/preset/${result.data.uploadPreset.slug}`);
    } catch (err) {
      console.error("Error uploading:", err);
      setError(err instanceof Error ? err.message : "Failed to upload");
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
