import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Box,
  Chip,
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
import { useAuth } from "../context/AuthContext";
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

// Helper function to convert dynamic range number to string for upload mutation
const convertDynamicRangeToString = (value: number | null): string => {
  if (value === null) return "AUTO";
  switch (value) {
    case 100:
      return "DR100";
    case 200:
      return "DR200";
    case 400:
      return "DR400";
    default:
      return "AUTO";
  }
};

declare global {
  interface ImportMeta {
    env: {
      VITE_CLOUDINARY_CLOUD_NAME: string;
      VITE_CLOUDINARY_API_KEY: string;
      VITE_CLOUDINARY_API_SECRET: string;
    };
  }
}

const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
  apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
};

interface FilmSimSettings {
  dynamicRange: number | null;
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

const MAX_FILE_SIZE = 25 * 1024 * 1024; // roughly 25MB FYI
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
    dynamicRange: null,
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
  const [uploadFilmSim] = useMutation(UPLOAD_FILM_SIM);
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
    value: string | number | null | WhiteBalanceShift
  ) => {
    setFilmSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const validateFile = (file: File): boolean => {
    console.log(
      `Validating file: ${file.name}, type: ${file.type}, size: ${file.size}`
    );

    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
      const maxSizeMB = MAX_FILE_SIZE / 1024 / 1024;
      const errorMsg = `File "${file.name}" is too large (${fileSizeMB}MB). Maximum size is ${maxSizeMB}MB. Please use a smaller file.`;
      console.log(errorMsg);
      setFileError(errorMsg);
      return false;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      const errorMsg = `File "${file.name}" is not a supported image type. Please use JPEG, PNG, or WebP`;
      console.log(errorMsg);
      setFileError(errorMsg);
      return false;
    }
    console.log(`File "${file.name}" passed validation`);
    return true;
  };

  const uploadToCloudinary = async (file: File): Promise<SampleImageInput> => {
    console.log("Starting Cloudinary upload for file:", file.name);
    console.log("Cloudinary config:", {
      cloudName: cloudinaryConfig.cloudName,
      hasApiKey: !!cloudinaryConfig.apiKey,
      hasApiSecret: !!cloudinaryConfig.apiSecret,
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "FilmSimSamples");
    formData.append("folder", "filmsims");

    try {
      console.log("Uploading to Cloudinary...");
      console.log(
        "Upload URL:",
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("Cloudinary response status:", response.status);
      console.log("Cloudinary response ok:", response.ok);

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

    if (files.length === 0) {
      console.log("No files selected");
      return;
    }

    const validFiles = files.filter((file) => {
      const isValid = validateFile(file);
      return isValid;
    });
    if (validFiles.length === 0) {
      console.log("No valid files after validation");
      return;
    }

    try {
      setIsUploading(true);
      console.log("Starting upload process...");
      const uploadPromises = validFiles.map(async (file) => {
        const result = await uploadToCloudinary(file);
        return result;
      });
      const uploadedImages = await Promise.all(uploadPromises);
      console.log("All images uploaded successfully:", uploadedImages);

      setUploadedImageUrls((prev) => {
        const newUrls = [...prev, ...uploadedImages];
        console.log("Updated uploadedImageUrls:", newUrls);
        return newUrls;
      });
      setSampleImages((prev) => {
        const newImages = [...prev, ...validFiles];
        return newImages;
      });
    } catch (error) {
      setFileError(
        `Failed to upload images to Cloudinary: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsUploading(false);
    }

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
    if (!user) {
      setError("You must be logged in to upload a film simulation");
      return;
    }

    try {
      if (!title.trim()) {
        setError("Name is required");
        return;
      }
      if (!tags.length) {
        setError("Please add at least one tag");
        return;
      }
      if (uploadedImageUrls.length === 0) {
        setError("Please add at least one sample image");
        return;
      }
      setIsUploading(true);

      const formattedSettings = {
        dynamicRange: convertDynamicRangeToString(filmSettings.dynamicRange),
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
        grainEffect: filmSettings.grainEffect,
        clarity: Math.round(filmSettings.clarity) || 0,
        colorChromeEffect: filmSettings.colorChromeEffect,
        colorChromeFxBlue: filmSettings.colorChromeFxBlue,
      };

      const formattedSampleImages = uploadedImageUrls.map((img) => ({
        publicId: img.publicId,
        url: img.url,
      }));

      const variables = {
        name: title,
        description,
        settings: formattedSettings,
        notes,
        tags: tags.map((tag) => tag.toLowerCase()),
        sampleImages: formattedSampleImages,
      };

      const result = await uploadFilmSim({
        variables,
      });

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
              (opt) => (opt.value === null ? "null" : opt.value.toString()) === e.target.value
            )?.value;
            if (newValue !== undefined) {
              handleFilmSettingChange(settingKey, newValue);
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
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {fileError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setFileError(null)}
          >
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
              data-cy="film-sim-name-input"
            />

            <TextField
              label="Description"
              multiline
              minRows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!user}
              data-cy="film-sim-description-input"
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
                  data-cy="film-sim-tags-input"
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
                Sample Images *
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                At least one sample image is required (max 25MB, JPEG/PNG/WebP)
              </Typography>
              <Button
                component="label"
                variant="outlined"
                sx={{ mt: 1 }}
                disabled={!user || isUploading}
                startIcon={isUploading ? <CircularProgress size={20} /> : null}
                data-cy="film-sim-image-upload"
              >
                {isUploading ? "Uploading..." : "Add Images"}
                <input
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  onChange={handleImageChange}
                  multiple
                  style={{ display: "none" }}
                />
              </Button>
              {isUploading && (
                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                  Uploading images to Cloudinary...
                </Typography>
              )}
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
              data-cy="film-sim-notes-input"
            />

            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={
                  isUploading || !user || uploadedImageUrls.length === 0
                }
                startIcon={isUploading ? <CircularProgress size={20} /> : null}
                data-cy="film-sim-submit-button"
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
