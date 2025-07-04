import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Chip,
  Button,
  Divider,
  Avatar,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Grid,
  useMediaQuery,
  useTheme,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
} from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UploadIcon from "@mui/icons-material/Upload";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import ToneCurve from "../components/ToneCurve";
import SettingSliderDisplay from "../components/SettingSliderDisplay";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
import AddToListButton from "../components/AddToListButton";
import XmpParser from "../components/XmpParser";
import DiscussionThread from "../components/discussions/DiscussionThread";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import { GET_PRESET_BY_SLUG } from "../graphql/queries/getPresetBySlug";
import { DELETE_PRESET } from "../graphql/mutations/deletePreset";
import { UPDATE_PRESET } from "../graphql/mutations/updatePreset";
import { useAuth } from "../context/AuthContext";
import { downloadXMP, type PresetData } from "../utils/xmpCompiler";

const ADD_PHOTO_TO_PRESET = gql`
  mutation AddPhotoToPreset(
    $presetId: ID!
    $imageUrl: String!
    $caption: String
  ) {
    addPhotoToPreset(
      presetId: $presetId
      imageUrl: $imageUrl
      caption: $caption
    ) {
      id
      url
      caption
    }
  }
`;

// Cloudinary configuration
const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
  apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
};

const PresetDetails: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { loading, error, data } = useQuery(GET_PRESET_BY_SLUG, {
    variables: { slug },
  });
  const [deletePreset, { loading: deletingPreset }] =
    useMutation(DELETE_PRESET);
  const [updatePreset, { loading: updatingPreset }] =
    useMutation(UPDATE_PRESET);
  const [addPhotoToPreset, { loading: addingPhoto }] =
    useMutation(ADD_PHOTO_TO_PRESET);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const [parsedSettings, setParsedSettings] = React.useState<any>(null);
  const [editFormData, setEditFormData] = React.useState({
    title: "",
    description: "",
    notes: "",
    tags: "",
  });
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [addPhotoDialogOpen, setAddPhotoDialogOpen] = React.useState(false);
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [photoCaption, setPhotoCaption] = React.useState("");
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [fullscreenImage, setFullscreenImage] = React.useState<string | null>(
    null
  );
  const [showAllImages, setShowAllImages] = React.useState(false);
  const menuOpen = Boolean(menuAnchorEl);
  const [selectedColor, setSelectedColor] = useState("blue"); // default to blue

  const colorOrder = [
    { key: "red", color: "#ff3b30" },
    { key: "orange", color: "#ff9500" },
    { key: "yellow", color: "#ffcc00" },
    { key: "green", color: "#4cd964" },
    { key: "aqua", color: "#5ac8fa" },
    { key: "blue", color: "#007aff" },
    { key: "purple", color: "#af52de" },
    { key: "magenta", color: "#ff2d55" },
  ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    setEditFormData({
      title: preset.title,
      description: preset.description || "",
      notes: preset.notes || "",
      tags: preset.tags
        .map((tag: { displayName: string }) => tag.displayName)
        .join(", "),
    });
    setParsedSettings(null);
    setSaveError(null);
    setSaveSuccess(false);
    setEditDialogOpen(true);
  };

  const handleDelete = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "PresetSamples");
    formData.append("folder", "presets");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to upload image to Cloudinary: ${
            errorData.error?.message || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile || !currentUser) return;

    try {
      setUploadingPhoto(true);

      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(photoFile);

      // Add photo to preset
      await addPhotoToPreset({
        variables: {
          presetId: preset.id,
          imageUrl,
          caption: photoCaption || undefined,
        },
      });

      // Refresh the data
      // Note: You might need to implement a refetch mechanism here

      // Reset form
      setPhotoFile(null);
      setPhotoCaption("");
      setAddPhotoDialogOpen(false);
    } catch (error) {
      console.error("Error uploading photo:", error);
      // You could add error handling here
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
    }
  };

  const handleSettingsParsed = (settings: any) => {
    if (!settings || typeof settings !== "object") {
      console.error("Invalid settings format received from XMP parser");
      return;
    }
    setParsedSettings(settings);
  };

  // Helper function to safely get setting values from the new comprehensive structure
  const getSettingValue = (setting: string): number | undefined => {
    switch (setting) {
      case "exposure":
        return preset.settings?.exposure;
      case "contrast":
        return preset.settings?.contrast;
      case "highlights":
        return preset.settings?.highlights;
      case "shadows":
        return preset.settings?.shadows;
      case "whites":
        return preset.settings?.whites;
      case "blacks":
        return preset.settings?.blacks;
      case "temp":
        return preset.settings?.temp;
      case "tint":
        return preset.settings?.tint;
      case "vibrance":
        return preset.settings?.vibrance;
      case "saturation":
        return preset.settings?.saturation;
      case "clarity":
        return preset.settings?.clarity;
      case "dehaze":
        return preset.settings?.dehaze;
      case "texture":
        return preset.settings?.texture;
      default:
        return undefined;
    }
  };

  // Helper function to get current settings (either from XMP or original)
  const getCurrentSettings = () => {
    return parsedSettings || preset.settings;
  };

  // Helper function to strip __typename fields from objects
  const stripTypename = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(stripTypename);
    if (typeof obj === "object") {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key !== "__typename") {
          cleaned[key] = stripTypename(value);
        }
      }
      return cleaned;
    }
    return obj;
  };

  // Helper to get a muted color for each channel
  const colorMixerColor = (key: string) => {
    switch (key) {
      case "red":
        return "#b94a4a";
      case "orange":
        return "#b98a4a";
      case "yellow":
        return "#b9b84a";
      case "green":
        return "#4ab96b";
      case "aqua":
        return "#4ab9b9";
      case "blue":
        return "#4a6ab9";
      case "purple":
        return "#8a4ab9";
      case "magenta":
        return "#b94a8a";
      default:
        return "#888";
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Error loading preset: {error.message}</Alert>
      </Container>
    );
  }

  const preset = data?.getPreset;

  if (!preset) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Preset not found</Alert>
      </Container>
    );
  }

  const formatSettingValue = (value: any) => {
    if (value === undefined || value === null) return "0";
    // Convert to number and handle decimal places
    const num = Number(value);
    if (isNaN(num)) return "0";
    // If it's a whole number, return as is
    if (Number.isInteger(num)) return num.toString();
    // For decimal numbers, format with 1 decimal place
    return num.toFixed(1);
  };

  const parseSettingValue = (value: any) => {
    if (value === undefined || value === null) return 0;
    // Convert to number
    const num = Number(value);
    if (isNaN(num)) return 0;
    // Convert to integer by multiplying by 100
    return Math.round(num * 100);
  };

  const formatToneCurveData = (curveData: any) => {
    if (!curveData) return [0, 64, 128, 192, 255];

    // Convert x,y coordinates to output values
    // The ToneCurve component expects an array of 5 values for input [0, 64, 128, 192, 255]
    const inputPoints = [0, 64, 128, 192, 255];
    const outputPoints = inputPoints.map((input) => {
      // Find the two points that surround this input value
      const lowerPoint = curveData.reduce((prev: any, curr: any) => {
        return curr.x <= input && (!prev || curr.x > prev.x) ? curr : prev;
      }, null);

      const upperPoint = curveData.reduce((prev: any, curr: any) => {
        return curr.x >= input && (!prev || curr.x < prev.x) ? curr : prev;
      }, null);

      if (!lowerPoint || !upperPoint) return input;
      if (lowerPoint.x === upperPoint.x) return lowerPoint.y;

      // Linear interpolation between points
      const ratio = (input - lowerPoint.x) / (upperPoint.x - lowerPoint.x);
      return Math.round(lowerPoint.y + ratio * (upperPoint.y - lowerPoint.y));
    });

    return outputPoints;
  };

  const handleDeletePreset = async () => {
    try {
      await deletePreset({
        variables: { id: preset.id },
      });
      navigate("/");
    } catch (err) {
      console.error("Error deleting preset:", err);
    }
  };

  const handleDownloadXMP = () => {
    // Convert tone curve data from database format to XMP compiler format
    const convertToneCurve = (curveData: any) => {
      if (!curveData || !Array.isArray(curveData)) return undefined;
      return curveData.map((point: any) => ({ x: point.x, y: point.y }));
    };

    const presetData: PresetData = {
      title: preset.title,
      description: preset.description || "",
      settings: preset.settings || {},
      toneCurve: {
        rgb: convertToneCurve(preset.toneCurve?.rgb),
        red: convertToneCurve(preset.toneCurve?.red),
        green: convertToneCurve(preset.toneCurve?.green),
        blue: convertToneCurve(preset.toneCurve?.blue),
      },
      whiteBalance: "Custom", // Default value since field doesn't exist in backend
      cameraProfile: "Adobe Standard", // Default value since field doesn't exist in backend
      profileName: "Adobe Standard", // Default value since field doesn't exist in backend
      version: "15.0", // Default value since field doesn't exist in backend
      processVersion: "15.0", // Default value since field doesn't exist in backend
      creator: preset.creator?.username || "VISOR",
      dateCreated: preset.createdAt,
    };

    downloadXMP(presetData);
  };

  const handleSavePreset = async () => {
    try {
      // Process tags from comma-separated string
      const tagNames = editFormData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // Prepare the update input
      const updateInput: any = {
        title: editFormData.title,
        description: editFormData.description,
        notes: editFormData.notes,
      };

      // Always include settings - either from XMP or current preset
      if (parsedSettings) {
        // Use parsed settings from XMP
        updateInput.settings = {
          exposure: parsedSettings.exposure || 0,
          contrast: parsedSettings.contrast || 0,
          highlights: parsedSettings.highlights || 0,
          shadows: parsedSettings.shadows || 0,
          whites: parsedSettings.whites || 0,
          blacks: parsedSettings.blacks || 0,
          temp: parsedSettings.temp || 0,
          tint: parsedSettings.tint || 0,
          vibrance: parsedSettings.vibrance || 0,
          saturation: parsedSettings.saturation || 0,
          clarity: parsedSettings.clarity || 0,
          dehaze: parsedSettings.dehaze || 0,
          grain: parsedSettings.grain
            ? {
                amount: parsedSettings.grain.amount || 0,
                size: parsedSettings.grain.size || 0,
                roughness: parsedSettings.grain.roughness || 0,
              }
            : undefined,
          sharpening: parsedSettings.sharpening || 0,
          noiseReduction: parsedSettings.noiseReduction
            ? {
                luminance: parsedSettings.noiseReduction.luminance || 0,
                detail: parsedSettings.noiseReduction.detail || 0,
                color: parsedSettings.noiseReduction.color || 0,
              }
            : undefined,
        };

        // Include tone curve if present
        if (parsedSettings.toneCurve) {
          updateInput.toneCurve = {
            rgb: parsedSettings.toneCurve.rgb || [],
            red: parsedSettings.toneCurve.red || [],
            green: parsedSettings.toneCurve.green || [],
            blue: parsedSettings.toneCurve.blue || [],
          };
        }
      } else {
        // Use current preset settings
        updateInput.settings = stripTypename(preset.settings);
        if (preset.toneCurve) {
          updateInput.toneCurve = stripTypename(preset.toneCurve);
        }
      }

      // For now, we'll skip tag updates since the backend expects tag IDs
      // and we're working with tag names. This would require additional
      // backend support for tag creation/management.
      console.log("Updating preset with input:", updateInput);
      console.log("Tag names to be processed:", tagNames);

      await updatePreset({
        variables: {
          id: preset.id,
          input: updateInput,
        },
        refetchQueries: [
          {
            query: GET_PRESET_BY_SLUG,
            variables: { slug: preset.slug },
          },
        ],
      });

      setEditDialogOpen(false);
      setParsedSettings(null);
      setSaveSuccess(true);
      setSaveError(null);
    } catch (err) {
      console.error("Error updating preset:", err);
      setSaveError(
        "An error occurred while updating the preset. Please try again later."
      );
    }
  };

  // Get before/after images from beforeImage and afterImage fields
  const beforeImage = preset.beforeImage?.url;
  const afterImage = preset.afterImage?.url;

  // Format tone curve data
  const toneCurveData = {
    rgb: formatToneCurveData(preset.toneCurve?.rgb),
    red: formatToneCurveData(preset.toneCurve?.red),
    green: formatToneCurveData(preset.toneCurve?.green),
    blue: formatToneCurveData(preset.toneCurve?.blue),
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 10, position: "relative" }}>
      <AddToListButton presetId={preset.id} itemName={preset.title} />

      {/* Creator Information */}
      <Box mb={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar
            src={preset.creator.avatar}
            alt={preset.creator.username}
            sx={{ cursor: "pointer" }}
            onClick={() => navigate(`/profile/${preset.creator.id}`)}
          />
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate(`/profile/${preset.creator.id}`)}
          >
            {preset.creator.username}
          </Typography>
          {preset.creator.instagram && (
            <Button
              href={`https://instagram.com/${preset.creator.instagram}`}
              target="_blank"
              size="small"
              variant="text"
              sx={{ ml: 1, minWidth: 0, padding: 0.5 }}
            >
              <InstagramIcon fontSize="small" />
            </Button>
          )}
        </Stack>
      </Box>

      {/* Title & Edit Menu */}
      <Box mb={3}>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Typography variant="h4" fontWeight="bold">
            {preset.title}
          </Typography>
          {currentUser &&
            preset.creator &&
            currentUser.id === preset.creator.id && (
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
        </Box>
        <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
          {preset.tags.map((tag: { id: string; displayName: string }) => (
            <Chip
              key={tag.id}
              label={tag.displayName}
              variant="outlined"
              sx={{ color: "text.secondary", borderColor: "divider" }}
            />
          ))}
        </Stack>
      </Box>

      {/* Dropdown Menu */}
      {currentUser &&
        preset.creator &&
        currentUser.id === preset.creator.id && (
          <Menu
            anchorEl={menuAnchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                backgroundColor: "background.paper",
                boxShadow: 1,
              },
            }}
          >
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Edit" />
            </MenuItem>
            <MenuItem onClick={handleDelete}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Delete" />
            </MenuItem>
          </Menu>
        )}

      {/* Before/After Images */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" mb={2}>
          Before & After
        </Typography>
        <BeforeAfterSlider
          beforeImage={beforeImage}
          afterImage={afterImage}
          height={500}
        />
      </Box>

      <Typography variant="body1" color="text.secondary" mb={2}>
        {preset.description}
      </Typography>

      {/* Accordion Sections */}
      {/* Light */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Light
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <SettingSliderDisplay
              label="Exposure"
              value={formatSettingValue((preset.settings?.exposure || 0) / 100)}
            />
            <SettingSliderDisplay
              label="Contrast"
              value={formatSettingValue((preset.settings?.contrast || 0) / 100)}
            />
            <SettingSliderDisplay
              label="Highlights"
              value={formatSettingValue(
                (preset.settings?.highlights || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Shadows"
              value={formatSettingValue((preset.settings?.shadows || 0) / 100)}
            />
            <SettingSliderDisplay
              label="Whites"
              value={formatSettingValue((preset.settings?.whites || 0) / 100)}
            />
            <SettingSliderDisplay
              label="Blacks"
              value={formatSettingValue((preset.settings?.blacks || 0) / 100)}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Tone Curve */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Tone Curve
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ToneCurve curves={toneCurveData} />
        </AccordionDetails>
      </Accordion>

      {/* Color (Lightroom style, in Accordion) */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Color
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {/* White Balance and Color Sliders */}
          <Typography variant="body2" gutterBottom>
            White Balance: {preset.whiteBalance || "Custom"}
          </Typography>
          {[
            {
              label: "Temp",
              key: "temp",
              spectrum:
                "linear-gradient(to right, #4a90e2, #eaeaea, #f7e7b6, #e2c44a)",
            },
            {
              label: "Tint",
              key: "tint",
              spectrum: "linear-gradient(to right, #4ae2a1, #eaeaea, #e24ad6)",
            },
            {
              label: "Vibrance",
              key: "vibrance",
              spectrum:
                "linear-gradient(to right, #444, #3b4a6a, #3b6a4a, #6a6a3b, #6a4a3b, #b94a4a)",
            },
            {
              label: "Saturation",
              key: "saturation",
              spectrum:
                "linear-gradient(to right, #444, #3b4a6a, #3b6a4a, #6a6a3b, #6a4a3b, #b94a4a)",
            },
          ].map(({ label, key, spectrum }) => (
            <SettingSliderDisplay
              key={key}
              label={label}
              value={preset.settings?.[key] || 0}
              spectrum={spectrum}
            />
          ))}

          {/* Color Mixer */}
          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Color Mixer
            </Typography>
            <ToggleButtonGroup
              value={selectedColor}
              exclusive
              onChange={(_, v) => v && setSelectedColor(v)}
              sx={{ mb: 2 }}
            >
              {colorOrder.map(({ key, color }) => (
                <ToggleButton
                  key={key}
                  value={key}
                  sx={{ p: 0.5, mx: 0.5, border: "none" }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: color,
                      border:
                        selectedColor === key
                          ? "2px solid #fff"
                          : "2px solid #222",
                    }}
                  />
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            {/* Color Mixer Sliders */}
            <SettingSliderDisplay
              label="Hue"
              value={
                preset.settings?.colorAdjustments?.[selectedColor]?.hue || 0
              }
              spectrum="linear-gradient(to right, #b94a4a, #b98a4a, #b9b84a, #4ab96b, #4ab9b9, #4a6ab9, #8a4ab9, #b94a8a, #b94a4a)"
            />
            <SettingSliderDisplay
              label="Saturation"
              value={
                preset.settings?.colorAdjustments?.[selectedColor]
                  ?.saturation || 0
              }
              spectrum={`linear-gradient(to right, #888, ${colorMixerColor(
                selectedColor
              )}, #888)`}
            />
            <SettingSliderDisplay
              label="Luminance"
              value={
                preset.settings?.colorAdjustments?.[selectedColor]?.luminance ||
                0
              }
              spectrum={`linear-gradient(to right, #222, ${colorMixerColor(
                selectedColor
              )}, #fff)`}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Effects */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Effects
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <SettingSliderDisplay
              label="Clarity"
              value={formatSettingValue((preset.settings?.clarity || 0) / 100)}
            />
            <SettingSliderDisplay
              label="Dehaze"
              value={formatSettingValue((preset.settings?.dehaze || 0) / 100)}
            />
            <SettingSliderDisplay
              label="Texture"
              value={formatSettingValue((preset.settings?.texture || 0) / 100)}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Split Toning */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Split Toning
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Shadows
            </Typography>
            <SettingSliderDisplay
              label="Hue"
              value={formatSettingValue(
                (preset.splitToning?.shadowHue || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Saturation"
              value={formatSettingValue(
                (preset.splitToning?.shadowSaturation || 0) / 100
              )}
            />

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              Highlights
            </Typography>
            <SettingSliderDisplay
              label="Hue"
              value={formatSettingValue(
                (preset.splitToning?.highlightHue || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Saturation"
              value={formatSettingValue(
                (preset.splitToning?.highlightSaturation || 0) / 100
              )}
            />

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              Balance
            </Typography>
            <SettingSliderDisplay
              label="Balance"
              value={formatSettingValue(
                (preset.splitToning?.balance || 0) / 100
              )}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Grain */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Grain
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <SettingSliderDisplay
              label="Amount"
              value={formatSettingValue(
                (preset.effects?.grainAmount || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Size"
              value={formatSettingValue((preset.effects?.grainSize || 0) / 100)}
            />
            <SettingSliderDisplay
              label="Frequency"
              value={formatSettingValue(
                (preset.effects?.grainFrequency || 0) / 100
              )}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Detail */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Detail
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Sharpening
            </Typography>
            <SettingSliderDisplay
              label="Amount"
              value={formatSettingValue(
                (preset.settings?.sharpening || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Radius"
              value={formatSettingValue(
                (preset.settings?.sharpenRadius || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Detail"
              value={formatSettingValue(
                (preset.settings?.sharpenDetail || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Edge Masking"
              value={formatSettingValue(
                (preset.settings?.sharpenEdgeMasking || 0) / 100
              )}
            />

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              Noise Reduction
            </Typography>
            <SettingSliderDisplay
              label="Luminance Smoothing"
              value={formatSettingValue(
                (preset.settings?.luminanceSmoothing || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Luminance Detail"
              value={formatSettingValue(
                (preset.settings?.luminanceDetail || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Luminance Contrast"
              value={formatSettingValue(
                (preset.settings?.luminanceContrast || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Color Noise Reduction"
              value={formatSettingValue(
                (preset.settings?.noiseReduction?.color || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Color Detail"
              value={formatSettingValue(
                (preset.settings?.noiseReduction?.detail || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Color Smoothness"
              value={formatSettingValue(
                (preset.settings?.noiseReduction?.smoothness || 0) / 100
              )}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Color Adjustments (HSL) */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Color Adjustments (HSL)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Red
              </Typography>
              <SettingSliderDisplay
                label="Hue"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.red?.hue || 0) / 100
                )}
              />
              <SettingSliderDisplay
                label="Saturation"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.red?.saturation || 0) /
                    100
                )}
              />
              <SettingSliderDisplay
                label="Luminance"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.red?.luminance || 0) / 100
                )}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Orange
              </Typography>
              <SettingSliderDisplay
                label="Hue"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.orange?.hue || 0) / 100
                )}
              />
              <SettingSliderDisplay
                label="Saturation"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.orange?.saturation || 0) /
                    100
                )}
              />
              <SettingSliderDisplay
                label="Luminance"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.orange?.luminance || 0) /
                    100
                )}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Yellow
              </Typography>
              <SettingSliderDisplay
                label="Hue"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.yellow?.hue || 0) / 100
                )}
              />
              <SettingSliderDisplay
                label="Saturation"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.yellow?.saturation || 0) /
                    100
                )}
              />
              <SettingSliderDisplay
                label="Luminance"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.yellow?.luminance || 0) /
                    100
                )}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Green
              </Typography>
              <SettingSliderDisplay
                label="Hue"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.green?.hue || 0) / 100
                )}
              />
              <SettingSliderDisplay
                label="Saturation"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.green?.saturation || 0) /
                    100
                )}
              />
              <SettingSliderDisplay
                label="Luminance"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.green?.luminance || 0) /
                    100
                )}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Aqua
              </Typography>
              <SettingSliderDisplay
                label="Hue"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.aqua?.hue || 0) / 100
                )}
              />
              <SettingSliderDisplay
                label="Saturation"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.aqua?.saturation || 0) /
                    100
                )}
              />
              <SettingSliderDisplay
                label="Luminance"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.aqua?.luminance || 0) /
                    100
                )}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Blue
              </Typography>
              <SettingSliderDisplay
                label="Hue"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.blue?.hue || 0) / 100
                )}
              />
              <SettingSliderDisplay
                label="Saturation"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.blue?.saturation || 0) /
                    100
                )}
              />
              <SettingSliderDisplay
                label="Luminance"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.blue?.luminance || 0) /
                    100
                )}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Purple
              </Typography>
              <SettingSliderDisplay
                label="Hue"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.purple?.hue || 0) / 100
                )}
              />
              <SettingSliderDisplay
                label="Saturation"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.purple?.saturation || 0) /
                    100
                )}
              />
              <SettingSliderDisplay
                label="Luminance"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.purple?.luminance || 0) /
                    100
                )}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Magenta
              </Typography>
              <SettingSliderDisplay
                label="Hue"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.magenta?.hue || 0) / 100
                )}
              />
              <SettingSliderDisplay
                label="Saturation"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.magenta?.saturation ||
                    0) / 100
                )}
              />
              <SettingSliderDisplay
                label="Luminance"
                value={formatSettingValue(
                  (preset.settings?.colorAdjustments?.magenta?.luminance || 0) /
                    100
                )}
              />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Color Grading */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Color Grading
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Shadows
            </Typography>
            <SettingSliderDisplay
              label="Hue"
              value={formatSettingValue(
                (preset.colorGrading?.shadowHue || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Saturation"
              value={formatSettingValue(
                (preset.colorGrading?.shadowSat || 0) / 100
              )}
            />

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              Midtones
            </Typography>
            <SettingSliderDisplay
              label="Hue"
              value={formatSettingValue(
                (preset.colorGrading?.midtoneHue || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Saturation"
              value={formatSettingValue(
                (preset.colorGrading?.midtoneSat || 0) / 100
              )}
            />

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              Highlights
            </Typography>
            <SettingSliderDisplay
              label="Hue"
              value={formatSettingValue(
                (preset.colorGrading?.highlightHue || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Saturation"
              value={formatSettingValue(
                (preset.colorGrading?.highlightSat || 0) / 100
              )}
            />

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              Global
            </Typography>
            <SettingSliderDisplay
              label="Blending"
              value={formatSettingValue(
                (preset.colorGrading?.blending || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Global Hue"
              value={formatSettingValue(
                (preset.colorGrading?.globalHue || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Global Saturation"
              value={formatSettingValue(
                (preset.colorGrading?.globalSat || 0) / 100
              )}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Lens Corrections */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Lens Corrections
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <SettingSliderDisplay
              label="Manual Distortion"
              value={formatSettingValue(
                (preset.lensCorrections?.lensManualDistortionAmount || 0) / 100
              )}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Profile: {preset.lensCorrections?.lensProfileName || "None"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Perspective:{" "}
              {preset.lensCorrections?.perspectiveUpright || "None"}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Optics */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Optics
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <SettingSliderDisplay
              label="Vignette Amount"
              value={formatSettingValue(
                (preset.optics?.vignetteAmount || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Vignette Midpoint"
              value={formatSettingValue(
                (preset.optics?.vignetteMidpoint || 0) / 100
              )}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Transform */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Transform
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <SettingSliderDisplay
              label="Perspective Vertical"
              value={formatSettingValue(
                (preset.transform?.perspectiveVertical || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Perspective Horizontal"
              value={formatSettingValue(
                (preset.transform?.perspectiveHorizontal || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Perspective Rotate"
              value={formatSettingValue(
                (preset.transform?.perspectiveRotate || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Perspective Scale"
              value={formatSettingValue(
                (preset.transform?.perspectiveScale || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Perspective Aspect"
              value={formatSettingValue(
                (preset.transform?.perspectiveAspect || 0) / 100
              )}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Effects (Enhanced) */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Effects (Enhanced)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <SettingSliderDisplay
              label="Post-Crop Vignette Amount"
              value={formatSettingValue(
                (preset.effects?.postCropVignetteAmount || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Post-Crop Vignette Midpoint"
              value={formatSettingValue(
                (preset.effects?.postCropVignetteMidpoint || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Post-Crop Vignette Feather"
              value={formatSettingValue(
                (preset.effects?.postCropVignetteFeather || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Post-Crop Vignette Roundness"
              value={formatSettingValue(
                (preset.effects?.postCropVignetteRoundness || 0) / 100
              )}
            />
            <Typography variant="body2" color="text.secondary">
              Post-Crop Vignette Style:{" "}
              {preset.effects?.postCropVignetteStyle || "None"}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Calibration */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Calibration
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Red Primary
            </Typography>
            <SettingSliderDisplay
              label="Hue"
              value={formatSettingValue(
                (preset.calibration?.cameraCalibrationRedPrimaryHue || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Saturation"
              value={formatSettingValue(
                (preset.calibration?.cameraCalibrationRedPrimarySaturation ||
                  0) / 100
              )}
            />

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              Green Primary
            </Typography>
            <SettingSliderDisplay
              label="Hue"
              value={formatSettingValue(
                (preset.calibration?.cameraCalibrationGreenPrimaryHue || 0) /
                  100
              )}
            />
            <SettingSliderDisplay
              label="Saturation"
              value={formatSettingValue(
                (preset.calibration?.cameraCalibrationGreenPrimarySaturation ||
                  0) / 100
              )}
            />

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              Blue Primary
            </Typography>
            <SettingSliderDisplay
              label="Hue"
              value={formatSettingValue(
                (preset.calibration?.cameraCalibrationBluePrimaryHue || 0) / 100
              )}
            />
            <SettingSliderDisplay
              label="Saturation"
              value={formatSettingValue(
                (preset.calibration?.cameraCalibrationBluePrimarySaturation ||
                  0) / 100
              )}
            />

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              Shadow Tint
            </Typography>
            <SettingSliderDisplay
              label="Shadow Tint"
              value={formatSettingValue(
                (preset.calibration?.cameraCalibrationShadowTint || 0) / 100
              )}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Crop & Orientation */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Crop & Orientation
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Crop
            </Typography>
            <SettingSliderDisplay
              label="Top"
              value={formatSettingValue((preset.crop?.cropTop || 0) / 100)}
            />
            <SettingSliderDisplay
              label="Left"
              value={formatSettingValue((preset.crop?.cropLeft || 0) / 100)}
            />
            <SettingSliderDisplay
              label="Bottom"
              value={formatSettingValue((preset.crop?.cropBottom || 0) / 100)}
            />
            <SettingSliderDisplay
              label="Right"
              value={formatSettingValue((preset.crop?.cropRight || 0) / 100)}
            />
            <SettingSliderDisplay
              label="Angle"
              value={formatSettingValue((preset.crop?.cropAngle || 0) / 100)}
            />
            <Typography variant="body2" color="text.secondary">
              Constrain to Warp:{" "}
              {preset.crop?.cropConstrainToWarp ? "Yes" : "No"}
            </Typography>

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              Orientation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {preset.orientation || "None"}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Metadata */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Metadata
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Rating: {preset.metadata?.rating || "None"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Label: {preset.metadata?.label || "None"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Creator: {preset.metadata?.creator || "Unknown"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Date Created: {preset.metadata?.dateCreated || "Unknown"}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Camera & Profile Metadata */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Camera & Profile
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Process Version: {preset.version || "Unknown"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Camera Profile: {preset.cameraProfile || "Unknown"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Profile Name: {preset.profileName || "Unknown"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              White Balance: {preset.whiteBalance || "Unknown"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Look Table: {preset.lookTableName || "None"}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Sample Images */}
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h6">Sample Images</Typography>
          {currentUser && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setAddPhotoDialogOpen(true)}
              size="small"
            >
              Add Your Photo
            </Button>
          )}
        </Box>
        {afterImage ||
        (preset.sampleImages && preset.sampleImages.length > 0) ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr 1fr",
                md: "1fr 1fr",
                lg: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            {/* After image as the first sample image */}
            {afterImage && (
              <Box>
                <img
                  src={afterImage}
                  alt={`After applying ${preset.title}`}
                  style={{
                    width: "100%",
                    height: 200,
                    borderRadius: 12,
                    cursor: "pointer",
                    objectFit: "cover",
                  }}
                  onClick={() => setFullscreenImage(afterImage)}
                />
              </Box>
            )}
            {/* Real sample images */}
            {preset.sampleImages &&
              preset.sampleImages.map(
                (image: { id: string; url: string; caption?: string }) => (
                  <Box key={image.id}>
                    <img
                      src={image.url}
                      alt={image.caption || `Sample image for ${preset.title}`}
                      style={{
                        width: "100%",
                        height: 200,
                        borderRadius: 12,
                        cursor: "pointer",
                        objectFit: "cover",
                      }}
                      onClick={() => setFullscreenImage(image.url)}
                    />
                  </Box>
                )
              )}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            No sample images yet.
          </Typography>
        )}
      </Box>

      {/* Download + Notes */}
      <Stack direction="row" alignItems="center" spacing={2} my={4}>
        {currentUser ? (
          <Button
            onClick={handleDownloadXMP}
            variant="contained"
            startIcon={<DownloadIcon />}
          >
            Download .xmp
          </Button>
        ) : (
          <Button
            onClick={() => navigate("/login")}
            variant="outlined"
            startIcon={<DownloadIcon />}
            color="primary"
          >
            Login to Download .xmp
          </Button>
        )}
      </Stack>

      {preset.notes && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Creator Notes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {preset.notes}
          </Typography>
        </>
      )}

      {/* Discussion Thread */}
      <Box mt={4}>
        <DiscussionThread
          itemId={preset.id}
          itemType="preset"
          itemTitle={preset.title}
          itemSlug={preset.slug}
          itemThumbnail={preset.thumbnail}
          isEmbedded={true}
          showPreviewOnly={true}
          minimalHeader={true}
        />
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
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
              value={editFormData.title}
              onChange={(e) =>
                setEditFormData({ ...editFormData, title: e.target.value })
              }
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={editFormData.description}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  description: e.target.value,
                })
              }
            />
            <TextField
              label="Creator Notes"
              fullWidth
              multiline
              rows={3}
              value={editFormData.notes}
              onChange={(e) =>
                setEditFormData({ ...editFormData, notes: e.target.value })
              }
            />
            <TextField
              label="Tags (comma-separated)"
              fullWidth
              value={editFormData.tags}
              onChange={(e) =>
                setEditFormData({ ...editFormData, tags: e.target.value })
              }
              placeholder="e.g., portrait, landscape, street"
            />

            {/* XMP Parser Section */}
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
                  XMP file parsed successfully! Settings will be updated when
                  you save.
                </Alert>
              )}
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Settings
              </Typography>
              {(parsedSettings || preset.settings) && (
                <>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Light Settings</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "1fr 1fr",
                          },
                          gap: 2,
                        }}
                      >
                        {[
                          { key: "exposure", label: "Exposure" },
                          { key: "contrast", label: "Contrast" },
                          { key: "highlights", label: "Highlights" },
                          { key: "shadows", label: "Shadows" },
                          { key: "whites", label: "Whites" },
                          { key: "blacks", label: "Blacks" },
                        ].map((setting) => (
                          <Box key={setting.key}>
                            <SettingSliderDisplay
                              label={setting.label}
                              value={
                                getCurrentSettings()[setting.key]
                                  ? getCurrentSettings()[setting.key].toFixed(1)
                                  : "0"
                              }
                            />
                          </Box>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Color Settings</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "1fr 1fr",
                          },
                          gap: 2,
                        }}
                      >
                        {[
                          { key: "temp", label: "Temperature" },
                          { key: "tint", label: "Tint" },
                          { key: "vibrance", label: "Vibrance" },
                          { key: "saturation", label: "Saturation" },
                        ].map((setting) => (
                          <Box key={setting.key}>
                            <SettingSliderDisplay
                              label={setting.label}
                              value={
                                getCurrentSettings()[setting.key]
                                  ? getCurrentSettings()[setting.key].toFixed(1)
                                  : "0"
                              }
                            />
                          </Box>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Effects Settings</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "1fr 1fr",
                          },
                          gap: 2,
                        }}
                      >
                        {[
                          { key: "clarity", label: "Clarity" },
                          { key: "dehaze", label: "Dehaze" },
                        ].map((setting) => (
                          <Box key={setting.key}>
                            <SettingSliderDisplay
                              label={setting.label}
                              value={
                                getCurrentSettings()[setting.key]
                                  ? getCurrentSettings()[setting.key].toFixed(1)
                                  : "0"
                              }
                            />
                          </Box>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Grain Settings</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "1fr 1fr",
                          },
                          gap: 2,
                        }}
                      >
                        {(getCurrentSettings().effects || preset.effects) && (
                          <>
                            <Box>
                              <SettingSliderDisplay
                                label="Amount"
                                value={
                                  (
                                    getCurrentSettings().effects ||
                                    preset.effects
                                  )?.grainAmount
                                    ? (
                                        getCurrentSettings().effects ||
                                        preset.effects
                                      ).grainAmount.toFixed(1)
                                    : "0"
                                }
                              />
                            </Box>
                            <Box>
                              <SettingSliderDisplay
                                label="Size"
                                value={
                                  (
                                    getCurrentSettings().effects ||
                                    preset.effects
                                  )?.grainSize
                                    ? (
                                        getCurrentSettings().effects ||
                                        preset.effects
                                      ).grainSize.toFixed(1)
                                    : "0"
                                }
                              />
                            </Box>
                            <Box>
                              <SettingSliderDisplay
                                label="Frequency"
                                value={
                                  (
                                    getCurrentSettings().effects ||
                                    preset.effects
                                  )?.grainFrequency
                                    ? (
                                        getCurrentSettings().effects ||
                                        preset.effects
                                      ).grainFrequency.toFixed(1)
                                    : "0"
                                }
                              />
                            </Box>
                          </>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">
                        Noise Reduction Settings
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "1fr 1fr",
                          },
                          gap: 2,
                        }}
                      >
                        {getCurrentSettings().detail && (
                          <>
                            <Box>
                              <SettingSliderDisplay
                                label="Luminance Smoothing"
                                value={
                                  getCurrentSettings().detail.luminanceSmoothing
                                    ? getCurrentSettings().detail.luminanceSmoothing.toFixed(
                                        1
                                      )
                                    : "0"
                                }
                              />
                            </Box>
                            <Box>
                              <SettingSliderDisplay
                                label="Color Noise Reduction"
                                value={
                                  getCurrentSettings().detail
                                    .colorNoiseReduction
                                    ? getCurrentSettings().detail.colorNoiseReduction.toFixed(
                                        1
                                      )
                                    : "0"
                                }
                              />
                            </Box>
                            <Box>
                              <SettingSliderDisplay
                                label="Luminance Detail"
                                value={
                                  getCurrentSettings().detail.luminanceDetail
                                    ? getCurrentSettings().detail.luminanceDetail.toFixed(
                                        1
                                      )
                                    : "0"
                                }
                              />
                            </Box>
                          </>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Detail Settings</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "1fr 1fr",
                          },
                          gap: 2,
                        }}
                      >
                        <Box>
                          <SettingSliderDisplay
                            label="Sharpening"
                            value={
                              getCurrentSettings().sharpening
                                ? getCurrentSettings().sharpening.toFixed(1)
                                : "0"
                            }
                          />
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </>
              )}
            </Box>

            {/* Success/Error Messages */}
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
          <Button
            onClick={() => setEditDialogOpen(false)}
            disabled={updatingPreset}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSavePreset}
            disabled={updatingPreset}
          >
            {updatingPreset ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Preset</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{preset.title}"? This action cannot
            be undone and will permanently remove the preset and all associated
            images from the database.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeletePreset}
            color="error"
            variant="contained"
            disabled={deletingPreset}
          >
            {deletingPreset ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fullscreen Image Modal */}
      <Dialog
        open={!!fullscreenImage}
        onClose={() => setFullscreenImage(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: "rgba(0,0,0,0.95)",
            boxShadow: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        <IconButton
          onClick={() => setFullscreenImage(null)}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: "white",
            zIndex: 10,
            background: "rgba(0,0,0,0.3)",
            "&:hover": { background: "rgba(0,0,0,0.5)" },
          }}
        >
          <CloseIcon />
        </IconButton>
        {fullscreenImage && (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 400,
            }}
          >
            <img
              src={fullscreenImage}
              alt="Full size sample"
              style={{
                maxWidth: "90vw",
                maxHeight: "80vh",
                borderRadius: 12,
                boxShadow: "0 0 32px 0 rgba(0,0,0,0.7)",
                background: "#111",
              }}
            />
          </Box>
        )}
      </Dialog>

      {/* Add Photo Dialog */}
      <Dialog
        open={addPhotoDialogOpen}
        onClose={() => setAddPhotoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Add Your Photo</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Share a photo you've edited using the "{preset.title}" preset
            </Typography>

            <Box>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ py: 2 }}
              >
                {photoFile ? photoFile.name : "Choose Photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileChange}
                  style={{ display: "none" }}
                />
              </Button>
            </Box>

            {photoFile && (
              <Box>
                <img
                  src={URL.createObjectURL(photoFile)}
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: 200,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              </Box>
            )}

            <TextField
              label="Caption (optional)"
              value={photoCaption}
              onChange={(e) => setPhotoCaption(e.target.value)}
              multiline
              rows={2}
              placeholder="Describe your photo or how you used the preset..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddPhotoDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handlePhotoUpload}
            variant="contained"
            disabled={!photoFile || uploadingPhoto}
            startIcon={uploadingPhoto ? <CircularProgress size={20} /> : null}
          >
            {uploadingPhoto ? "Uploading..." : "Upload Photo"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PresetDetails;
