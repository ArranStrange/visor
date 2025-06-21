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
import ToneCurve from "../components/ToneCurve";
import SettingSliderDisplay from "../components/SettingSliderDisplay";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
import AddToListButton from "../components/AddToListButton";
import XmpParser from "../components/XmpParser";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GET_PRESET_BY_SLUG } from "../graphql/queries/getPresetBySlug";
import { DELETE_PRESET } from "../graphql/mutations/deletePreset";
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
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const [parsedSettings, setParsedSettings] = React.useState<any>(null);
  const menuOpen = Boolean(menuAnchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
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
          {preset.tags.map((tag) => (
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

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "background.paper",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h4" gutterBottom>
            Edit Preset
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Stack spacing={3}>
              <TextField
                label="Title"
                defaultValue={preset.title}
                fullWidth
                required
              />

              <TextField
                label="Description"
                multiline
                minRows={3}
                defaultValue={preset.description || ""}
                fullWidth
              />

              <TextField
                label="Creator Notes"
                multiline
                minRows={3}
                defaultValue={preset.notes || ""}
                fullWidth
              />

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Tags (comma-separated)
                </Typography>
                <TextField
                  fullWidth
                  defaultValue={
                    preset.tags?.map((tag) => tag.displayName).join(", ") || ""
                  }
                  placeholder="e.g., portrait, landscape, street"
                />
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  New XMP File (Optional)
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Upload a new XMP file to update the preset settings. Leave
                  empty to keep current settings.
                </Typography>
                <XmpParser onSettingsParsed={handleSettingsParsed} />
              </Box>

              {parsedSettings && (
                <>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">Light Settings</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
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
                                parsedSettings[setting.key]
                                  ? parsedSettings[setting.key].toFixed(1)
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
                          gridTemplateColumns: "1fr 1fr",
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
                                parsedSettings[setting.key]
                                  ? parsedSettings[setting.key].toFixed(1)
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
                          gridTemplateColumns: "1fr 1fr",
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
                                parsedSettings[setting.key]
                                  ? parsedSettings[setting.key].toFixed(1)
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
                          gridTemplateColumns: "1fr 1fr",
                          gap: 2,
                        }}
                      >
                        {parsedSettings.grain && (
                          <>
                            <Box>
                              <SettingSliderDisplay
                                label="Amount"
                                value={
                                  parsedSettings.grain.amount
                                    ? parsedSettings.grain.amount.toFixed(1)
                                    : "0"
                                }
                              />
                            </Box>
                            <Box>
                              <SettingSliderDisplay
                                label="Size"
                                value={
                                  parsedSettings.grain.size
                                    ? parsedSettings.grain.size.toFixed(1)
                                    : "0"
                                }
                              />
                            </Box>
                            <Box>
                              <SettingSliderDisplay
                                label="Frequency"
                                value={
                                  parsedSettings.grain.frequency
                                    ? parsedSettings.grain.frequency.toFixed(1)
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
                          gridTemplateColumns: "1fr 1fr",
                          gap: 2,
                        }}
                      >
                        {parsedSettings.noiseReduction && (
                          <>
                            <Box>
                              <SettingSliderDisplay
                                label="Luminance"
                                value={
                                  parsedSettings.noiseReduction.luminance
                                    ? parsedSettings.noiseReduction.luminance.toFixed(
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
                                  parsedSettings.noiseReduction.color
                                    ? parsedSettings.noiseReduction.color.toFixed(
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
                                  parsedSettings.noiseReduction.detail
                                    ? parsedSettings.noiseReduction.detail.toFixed(
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
                          gridTemplateColumns: "1fr 1fr",
                          gap: 2,
                        }}
                      >
                        <Box>
                          <SettingSliderDisplay
                            label="Texture"
                            value={
                              parsedSettings.texture
                                ? parsedSettings.texture.toFixed(1)
                                : "0"
                            }
                          />
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </>
              )}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              // TODO: Implement save functionality
              console.log("Save edit functionality to be implemented");
              setEditDialogOpen(false);
            }}
          >
            Save Changes
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
