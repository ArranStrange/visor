import React from "react";
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
} from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UploadIcon from "@mui/icons-material/Upload";
import ToneCurve from "../components/ToneCurve";
import SettingSliderDisplay from "../components/SettingSliderDisplay";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
import AddToListButton from "../components/AddToListButton";
import XmpParser from "../components/XmpParser";
import DiscussionThread from "../components/discussions/DiscussionThread";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GET_PRESET_BY_SLUG } from "../graphql/queries/getPresetBySlug";
import { DELETE_PRESET } from "../graphql/mutations/deletePreset";
import { UPDATE_PRESET } from "../graphql/mutations/updatePreset";
import { useAuth } from "../context/AuthContext";

const PresetDetails: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { loading, error, data } = useQuery(GET_PRESET_BY_SLUG, {
    variables: { slug },
  });
  const [deletePreset, { loading: deletingPreset }] =
    useMutation(DELETE_PRESET);
  const [updatePreset, { loading: updatingPreset }] =
    useMutation(UPDATE_PRESET);
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
  const menuOpen = Boolean(menuAnchorEl);

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

  const handleSettingsParsed = (settings: any) => {
    if (!settings || typeof settings !== "object") {
      console.error("Invalid settings format received from XMP parser");
      return;
    }
    setParsedSettings(settings);
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

  const renderAccordionSection = (
    title: string,
    keys: string[],
    content?: React.ReactNode
  ) => {
    const hasValidSettings = keys.some(
      (key) => preset.settings[key] !== undefined
    );
    if (!hasValidSettings && !content) return null;

    return (
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {content ? (
            content
          ) : (
            <Box>
              {keys.map((key) =>
                preset.settings[key] !== undefined ? (
                  <SettingSliderDisplay
                    key={key}
                    label={key}
                    value={formatSettingValue(preset.settings[key] / 100)}
                  />
                ) : null
              )}
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    );
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
              href={preset.creator.instagram}
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
      {renderAccordionSection("Light", [
        "exposure",
        "contrast",
        "highlights",
        "shadows",
        "whites",
        "blacks",
      ])}

      {renderAccordionSection(
        "Tone Curve",
        [],
        <ToneCurve curves={toneCurveData} />
      )}

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
          {preset.settings.grain && (
            <>
              <SettingSliderDisplay
                label="Amount"
                value={formatSettingValue(preset.settings.grain.amount / 100)}
              />
              <SettingSliderDisplay
                label="Size"
                value={formatSettingValue(preset.settings.grain.size / 100)}
              />
              <SettingSliderDisplay
                label="Roughness"
                value={formatSettingValue(
                  preset.settings.grain.roughness / 100
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
          {preset.settings.noiseReduction && (
            <>
              <SettingSliderDisplay
                label="Luminance"
                value={formatSettingValue(
                  preset.settings.noiseReduction.luminance / 100
                )}
              />
              <SettingSliderDisplay
                label="Color"
                value={formatSettingValue(
                  preset.settings.noiseReduction.color / 100
                )}
              />
              <SettingSliderDisplay
                label="Detail"
                value={formatSettingValue(
                  preset.settings.noiseReduction.detail / 100
                )}
              />
            </>
          )}
        </Box>
      )}

      {renderAccordionSection("Detail", ["sharpening"])}

      {/* Download + Notes */}
      <Stack direction="row" alignItems="center" spacing={2} my={4}>
        <Button
          href={preset.xmpUrl}
          download
          variant="contained"
          startIcon={<DownloadIcon />}
        >
          Download .xmp
        </Button>
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
                        {getCurrentSettings().grain && (
                          <>
                            <Box>
                              <SettingSliderDisplay
                                label="Amount"
                                value={
                                  getCurrentSettings().grain.amount
                                    ? getCurrentSettings().grain.amount.toFixed(
                                        1
                                      )
                                    : "0"
                                }
                              />
                            </Box>
                            <Box>
                              <SettingSliderDisplay
                                label="Size"
                                value={
                                  getCurrentSettings().grain.size
                                    ? getCurrentSettings().grain.size.toFixed(1)
                                    : "0"
                                }
                              />
                            </Box>
                            <Box>
                              <SettingSliderDisplay
                                label="Roughness"
                                value={
                                  getCurrentSettings().grain.roughness
                                    ? getCurrentSettings().grain.roughness.toFixed(
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
                        {getCurrentSettings().noiseReduction && (
                          <>
                            <Box>
                              <SettingSliderDisplay
                                label="Luminance"
                                value={
                                  getCurrentSettings().noiseReduction.luminance
                                    ? getCurrentSettings().noiseReduction.luminance.toFixed(
                                        1
                                      )
                                    : "0"
                                }
                              />
                            </Box>
                            <Box>
                              <SettingSliderDisplay
                                label="Color"
                                value={
                                  getCurrentSettings().noiseReduction.color
                                    ? getCurrentSettings().noiseReduction.color.toFixed(
                                        1
                                      )
                                    : "0"
                                }
                              />
                            </Box>
                            <Box>
                              <SettingSliderDisplay
                                label="Detail"
                                value={
                                  getCurrentSettings().noiseReduction.detail
                                    ? getCurrentSettings().noiseReduction.detail.toFixed(
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
    </Container>
  );
};

export default PresetDetails;
