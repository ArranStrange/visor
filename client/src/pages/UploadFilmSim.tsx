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
  Grid as Grid2,
} from "@mui/material";
import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import WhiteBalanceGrid from "../components/WhiteBalanceGrid";
import { WhiteBalanceShift } from "../components/WhiteBalanceGrid";
import DeleteIcon from "@mui/icons-material/Delete";
import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";
import { useAuth } from "../context/AuthContext";

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
  grainEffect: string;
  clarity: number;
  colorChromeEffect: string;
  colorChromeFxBlue: string;
}

interface SampleImageInput {
  publicId: string;
  url: string;
}

const DYNAMIC_RANGE_OPTIONS = [
  { value: "AUTO", label: "Auto" },
  { value: "DR100", label: "DR100" },
  { value: "DR200", label: "DR200 (min ISO 400)" },
  { value: "DR400", label: "DR400 (min ISO 800)" },
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
  { value: "FLUORESCENT_1", label: "Fluorescent Light 1 (Daylight)" },
  { value: "FLUORESCENT_2", label: "Fluorescent Light 2 (Warm White)" },
  { value: "FLUORESCENT_3", label: "Fluorescent Light 3 (Cool White)" },
  { value: "INCANDESCENT", label: "Incandescent" },
  { value: "UNDERWATER", label: "Underwater" },
  { value: "CUSTOM", label: "Custom" },
];

const TONE_SLIDER_OPTIONS = [
  { value: -4, label: "-4" },
  { value: -3, label: "-3" },
  { value: -2, label: "-2" },
  { value: -1, label: "-1" },
  { value: 0, label: "0 (Standard)" },
  { value: 1, label: "+1" },
  { value: 2, label: "+2" },
  { value: 3, label: "+3" },
  { value: 4, label: "+4" },
];

const COLOR_OPTIONS = [
  { value: -4, label: "-4" },
  { value: -3, label: "-3" },
  { value: -2, label: "-2" },
  { value: -1, label: "-1" },
  { value: 0, label: "0 (Standard)" },
  { value: 1, label: "+1" },
  { value: 2, label: "+2" },
  { value: 3, label: "+3" },
  { value: 4, label: "+4" },
];

const NOISE_REDUCTION_OPTIONS = [
  { value: -4, label: "-4" },
  { value: -3, label: "-3" },
  { value: -2, label: "-2" },
  { value: -1, label: "-1" },
  { value: 0, label: "0 (Standard)" },
  { value: 1, label: "+1" },
  { value: 2, label: "+2" },
  { value: 3, label: "+3" },
  { value: 4, label: "+4" },
];

const GRAIN_EFFECT_OPTIONS = [
  { value: "OFF", label: "Off" },
  { value: "WEAK_SMALL", label: "Weak / Small" },
  { value: "WEAK_LARGE", label: "Weak / Large" },
  { value: "STRONG_SMALL", label: "Strong / Small" },
  { value: "STRONG_LARGE", label: "Strong / Large" },
];

const CLARITY_OPTIONS = [
  { value: -5, label: "-5 (Softest)" },
  { value: -4, label: "-4" },
  { value: -3, label: "-3" },
  { value: -2, label: "-2" },
  { value: -1, label: "-1" },
  { value: 0, label: "0 (Standard)" },
  { value: 1, label: "+1" },
  { value: 2, label: "+2" },
  { value: 3, label: "+3" },
  { value: 4, label: "+4" },
  { value: 5, label: "+5 (Crispest)" },
];

const COLOR_CHROME_EFFECT_OPTIONS = [
  { value: "OFF", label: "Off" },
  { value: "WEAK", label: "Weak" },
  { value: "STRONG", label: "Strong" },
];

const COLOR_CHROME_FX_BLUE_OPTIONS = [
  { value: "OFF", label: "Off" },
  { value: "WEAK", label: "Weak" },
  { value: "STRONG", label: "Strong" },
];

const UPLOAD_FILM_SIM = gql`
  mutation UploadFilmSim(
    $name: String!
    $description: String
    $settings: FilmSimSettingsInput!
    $notes: String
    $tags: [String!]!
    $sampleImages: [SampleImageInput!]
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
  const [uploadedImageUrls, setUploadedImageUrls] = useState<
    SampleImageInput[]
  >([]);
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
    grainEffect: "OFF",
    clarity: 0,
    colorChromeEffect: "OFF",
    colorChromeFxBlue: "OFF",
  });
  const [uploadFilmSim, { loading: uploadLoading }] =
    useMutation(UPLOAD_FILM_SIM);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const { user } = useAuth();

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

  const uploadToCloudinary = async (file: File): Promise<SampleImageInput> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "FilmSimSamples");
    formData.append("folder", "filmsims");

    try {
      console.log("Uploading to Cloudinary...");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
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

      // Extract the public_id from the response
      const publicId = data.public_id;
      if (!publicId) {
        throw new Error("No public_id received from Cloudinary");
      }

      return {
        publicId,
        url: data.secure_url,
      };
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const files = Array.from(e.target.files || []);

    // Validate all files
    const validFiles = files.filter((file) => validateFile(file));

    if (validFiles.length > 0) {
      setSampleImages((prev) => [...prev, ...validFiles]);

      // Upload each file to Cloudinary
      try {
        setIsUploading(true);
        const uploadPromises = validFiles.map(async (file) => {
          console.log("Uploading file to Cloudinary:", file);
          const result = await uploadToCloudinary(file);
          console.log("Uploaded file result:", result);
          return result;
        });

        const uploadedImages = await Promise.all(uploadPromises);
        console.log("All images uploaded:", uploadedImages);
        setUploadedImageUrls(uploadedImages);
      } catch (error) {
        setFileError("Failed to upload images to Cloudinary");
        console.error("Error uploading images:", error);
      } finally {
        setIsUploading(false);
      }
    }

    // Reset the input
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setSampleImages((prev) => prev.filter((_, i) => i !== index));
    setUploadedImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFileError(null);

    // Check if user is authenticated
    if (!user) {
      setError("You must be logged in to upload a film simulation");
      return;
    }

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

      // Generate slug from title
      const slug = slugify(title, { lower: true, strict: true });

      // Format settings to match the backend schema
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
        colorChromeEffect: filmSettings.colorChromeEffect,
        colorChromeFxBlue: filmSettings.colorChromeFxBlue,
      };

      // Log the uploaded images to verify their structure
      console.log("Uploaded images before submission:", uploadedImageUrls);

      // Ensure each image has the required fields
      const formattedSampleImages = uploadedImageUrls.map((img) => ({
        publicId: img.publicId,
        url: img.url,
      }));

      console.log("Formatted sample images:", formattedSampleImages);

      // Prepare variables for the film sim mutation
      const variables = {
        name: title,
        description,
        settings: formattedSettings,
        notes,
        tags: tags.map((tag) => tag.toLowerCase()),
        sampleImages: formattedSampleImages,
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

        {filmSettings.whiteBalance !== "AUTO" && (
          <Box sx={{ mt: 2, mb: 3 }}>
            <WhiteBalanceGrid
              value={filmSettings.wbShift}
              onChange={(value) => handleFilmSettingChange("wbShift", value)}
            />
          </Box>
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
          TONE_SLIDER_OPTIONS,
          "sharpness"
        )}

        {renderSettingWithTooltip(
          "Highlight Tone",
          "Controls how bright areas roll off — lower for softer highlights",
          filmSettings.highlight,
          TONE_SLIDER_OPTIONS,
          "highlight"
        )}

        {renderSettingWithTooltip(
          "Shadow Tone",
          "Controls how dark areas roll in — lower for more detail in shadows",
          filmSettings.shadow,
          TONE_SLIDER_OPTIONS,
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
          GRAIN_EFFECT_OPTIONS,
          "grainEffect"
        )}

        {renderSettingWithTooltip(
          "Clarity",
          "Microcontrast — can affect overall 'bite' and punch",
          filmSettings.clarity,
          CLARITY_OPTIONS,
          "clarity"
        )}

        {renderSettingWithTooltip(
          "Color Chrome Effect",
          "Enhances color separation and depth",
          filmSettings.colorChromeEffect,
          COLOR_CHROME_EFFECT_OPTIONS,
          "colorChromeEffect"
        )}

        {renderSettingWithTooltip(
          "Color Chrome FX Blue",
          "Enhances blue color separation",
          filmSettings.colorChromeFxBlue,
          COLOR_CHROME_FX_BLUE_OPTIONS,
          "colorChromeFxBlue"
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

        {!user && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You must be logged in to upload a film simulation. Please log in to
            continue.
          </Alert>
        )}

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
              disabled={!user}
            />

            <TextField
              label="Description"
              multiline
              minRows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!user}
            />

            {user && renderFilmSettings()}

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
                  disabled={!user}
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
              <Button
                component="label"
                variant="outlined"
                sx={{ mt: 1 }}
                disabled={!user}
              >
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
                  <Grid2 container spacing={2}>
                    {sampleImages.map((file, index) => (
                      <Grid2
                        {...(undefined as any)}
                        key={index}
                        xs={12}
                        sm={6}
                        md={4}
                      >
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
                            src={
                              uploadedImageUrls[index]?.url ||
                              URL.createObjectURL(file)
                            }
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
                      </Grid2>
                    ))}
                  </Grid2>
                </Box>
              )}
            </Box>

            <TextField
              label="Creator Notes"
              multiline
              minRows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!user}
            />

            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isUploading || !user}
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
