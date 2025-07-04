import React from "react";
import {
  Container,
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import { GET_FILMSIM_BY_SLUG } from "../graphql/queries/getFilmSimBySlug";
import { DELETE_FILMSIM } from "../graphql/mutations/deleteFilmSim";
import PresetCard from "../components/PresetCard";
import AddToListButton from "../components/AddToListButton";
import DiscussionThread from "../components/discussions/DiscussionThread";
import WhiteBalanceGrid from "../components/WhiteBalanceGrid";
import RecommendedPresetsManager from "../components/RecommendedPresetsManager";
import { useAuth } from "../context/AuthContext";

// Cloudinary configuration
const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
  apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
};

import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InstagramIcon from "@mui/icons-material/Instagram";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const CREATE_COMMENT = gql`
  mutation CreateComment($filmSimId: ID!, $content: String!) {
    createComment(input: { filmSimId: $filmSimId, content: $content }) {
      id
      content
      author {
        id
        username
        avatar
      }
      createdAt
    }
  }
`;

const ADD_PHOTO_TO_FILMSIM = gql`
  mutation AddPhotoToFilmSim(
    $filmSimId: ID!
    $imageUrl: String!
    $caption: String
  ) {
    addPhotoToFilmSim(
      filmSimId: $filmSimId
      imageUrl: $imageUrl
      caption: $caption
    ) {
      id
      url
      caption
    }
  }
`;

const FilmSimDetails: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [commentInput, setCommentInput] = React.useState("");
  const [localComments, setLocalComments] = React.useState<any[]>([]);
  const { loading, error, data, refetch } = useQuery(GET_FILMSIM_BY_SLUG, {
    variables: { slug },
  });
  const [createComment, { loading: creatingComment }] =
    useMutation(CREATE_COMMENT);
  const [deleteFilmSim, { loading: deletingFilmSim }] =
    useMutation(DELETE_FILMSIM);
  const [addPhotoToFilmSim, { loading: addingPhoto }] =
    useMutation(ADD_PHOTO_TO_FILMSIM);
  const [fullscreenImage, setFullscreenImage] = React.useState<string | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [addPhotoDialogOpen, setAddPhotoDialogOpen] = React.useState(false);
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [photoCaption, setPhotoCaption] = React.useState("");
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [showAllImages, setShowAllImages] = React.useState(false);
  const [recommendedPresetsDialogOpen, setRecommendedPresetsDialogOpen] =
    React.useState(false);
  const menuOpen = Boolean(menuAnchorEl);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const initialImageCount = isMobile ? 2 : 3;

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
        <Alert severity="error">
          Error loading film simulation: {error.message}
        </Alert>
      </Container>
    );
  }

  const filmSim = data?.getFilmSim;

  if (!filmSim) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Film simulation not found</Alert>
      </Container>
    );
  }

  // Helper function to format setting values
  const formatSettingValue = (value: any) => {
    if (value === undefined || value === null) return "N/A";
    if (typeof value === "number") return value.toString();
    return value;
  };

  // Combine server and local comments for optimistic UI
  const allComments = [...(filmSim.comments || []), ...localComments];

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !currentUser) return;
    const optimisticComment = {
      id: `temp-${Date.now()}`,
      content: commentInput,
      author: {
        username: currentUser.username,
        avatar: currentUser.avatar,
      },
      createdAt: new Date().toISOString(),
    };
    setLocalComments((prev) => [optimisticComment, ...prev]);
    setCommentInput("");
    try {
      await createComment({
        variables: {
          filmSimId: filmSim.id,
          content: optimisticComment.content,
        },
      });
      refetch();
      setLocalComments([]);
    } catch (err) {
      // Optionally show error
    }
  };

  const handleDeleteFilmSim = async () => {
    try {
      await deleteFilmSim({
        variables: { id: filmSim.id },
      });
      navigate("/");
    } catch (err) {
      console.error("Error deleting film simulation:", err);
    }
  };

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

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "FilmSimSamples");
    formData.append("folder", "filmsims");

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

      // Add photo to film simulation
      await addPhotoToFilmSim({
        variables: {
          filmSimId: filmSim.id,
          imageUrl,
          caption: photoCaption || undefined,
        },
      });

      // Refresh the data
      refetch();

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

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: "relative" }}>
      <AddToListButton filmSimId={filmSim.id} itemName={filmSim.name} />

      {/* Creator Information */}
      {filmSim.creator && (
        <Box mb={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar
              src={filmSim.creator.avatar}
              alt={filmSim.creator.username}
              sx={{ cursor: "pointer" }}
              onClick={() => navigate(`/profile/${filmSim.creator.id}`)}
            />
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ cursor: "pointer" }}
              onClick={() => navigate(`/profile/${filmSim.creator.id}`)}
            >
              {filmSim.creator.username}
            </Typography>
            {filmSim.creator.instagram && (
              <Button
                href={`https://instagram.com/${filmSim.creator.instagram}`}
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
      )}

      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Typography variant="h4" fontWeight={700}>
          {filmSim.name}
        </Typography>
        {currentUser &&
          filmSim.creator &&
          currentUser.id === filmSim.creator.id && (
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
      {/* Dropdown Menu */}
      {currentUser &&
        filmSim.creator &&
        currentUser.id === filmSim.creator.id && (
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
      <Typography variant="body1" color="text.secondary" mb={2}>
        {filmSim.description}
      </Typography>

      {/* Tags and camera compatibility */}
      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
        {filmSim.tags?.map((tag: { id: string; displayName: string }) => (
          <Chip key={tag.id} label={tag.displayName} variant="outlined" />
        ))}
        {filmSim.compatibleCameras?.map((camera: string) => (
          <Chip key={camera} label={camera} color="secondary" />
        ))}
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Settings Grid */}
      <Box mb={4}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontWeight: 700, letterSpacing: 1, pl: 1, pt: 1 }}
        >
          In-Camera Settings
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 0, md: 4 },
          }}
        >
          {/* Left column: all settings except White Balance and WB Shift */}
          <Box sx={{ flex: 1, width: { xs: "100%", md: "50%" } }}>
            {(
              [
                {
                  key: "filmSimulation",
                  label: "Film Simulation",
                  value: filmSim.settings?.filmSimulation,
                },
                {
                  key: "grainEffect",
                  label: "Grain Effect",
                  value: filmSim.settings?.grainEffect,
                },
                {
                  key: "colorChromeEffect",
                  label: "Color Chrome Effect",
                  value: filmSim.settings?.colorChromeEffect,
                },
                {
                  key: "colorChromeFxBlue",
                  label: "Color Chrome FX Blue",
                  value: filmSim.settings?.colorChromeFxBlue,
                },
                {
                  key: "dynamicRange",
                  label: "Dynamic Range",
                  value: filmSim.settings?.dynamicRange,
                },
                {
                  key: "highlight",
                  label: "Highlight Tone",
                  value: filmSim.settings?.highlight,
                },
                {
                  key: "shadow",
                  label: "Shadow Tone",
                  value: filmSim.settings?.shadow,
                },
                {
                  key: "colour",
                  label: "Colour",
                  value: filmSim.settings?.colour,
                },
                {
                  key: "sharpness",
                  label: "Sharpness",
                  value: filmSim.settings?.sharpness,
                },
                {
                  key: "noiseReduction",
                  label: "Noise Reduction",
                  value: filmSim.settings?.noiseReduction,
                },
                {
                  key: "clarity",
                  label: "Clarity",
                  value: filmSim.settings?.clarity,
                },
              ] as { key: string; label: string; value: any }[]
            ).map((setting) => (
              <Box
                key={setting.key}
                sx={{
                  width: "100%",
                  bgcolor: "grey.900",
                  color: "grey.100",
                  borderRadius: 2,
                  px: { xs: 2, sm: 3 },
                  py: { xs: 0.25, sm: 0.5 },
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  fontWeight: 600,
                  fontSize: { xs: "0.80rem", sm: "0.95rem" },
                  letterSpacing: 0.2,
                  minHeight: { xs: 22, sm: 30 },
                  mb: 2,
                }}
              >
                <span
                  style={{
                    opacity: 0.6,
                    width: "50%",
                    textAlign: "start",
                    display: "inline-block",
                    zIndex: 1,
                  }}
                >
                  {setting.label}
                </span>
                <Box
                  sx={{
                    position: "absolute",
                    left: "50%",
                    top: 6,
                    bottom: 6,
                    height: "auto",
                    borderLeft: "1px solid #444",
                    transform: "translateX(-50%)",
                    zIndex: 2,
                  }}
                />
                <span
                  style={{
                    fontWeight: 700,
                    width: "50%",
                    textAlign: "end",
                    display: "inline-block",
                    zIndex: 1,
                  }}
                >
                  {formatSettingValue(setting.value)}
                </span>
              </Box>
            ))}
          </Box>
          {/* Right column: White Balance, WB Shift, and WhiteBalanceGrid */}
          <Box
            sx={{
              flex: 1,
              width: { xs: "100%", md: "50%" },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: { md: "space-between" },
              minHeight: { md: 340 },
            }}
          >
            {/* White Balance pill */}
            {filmSim.settings?.whiteBalance && (
              <Box
                sx={{
                  width: "100%",
                  bgcolor: "grey.900",
                  color: "grey.100",
                  borderRadius: 2,
                  px: { xs: 2, sm: 3 },
                  py: { xs: 0.25, sm: 0.5 },
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  fontWeight: 600,
                  fontSize: { xs: "0.80rem", sm: "0.95rem" },
                  letterSpacing: 0.2,
                  minHeight: { xs: 22, sm: 30 },
                  mb: 2,
                }}
              >
                <span
                  style={{
                    opacity: 0.6,
                    width: "50%",
                    textAlign: "start",
                    display: "inline-block",
                    zIndex: 1,
                  }}
                >
                  White Balance
                </span>
                <Box
                  sx={{
                    position: "absolute",
                    left: "50%",
                    top: 6,
                    bottom: 6,
                    height: "auto",
                    borderLeft: "1px solid #444",
                    transform: "translateX(-50%)",
                    zIndex: 2,
                  }}
                />
                <span
                  style={{
                    fontWeight: 700,
                    width: "50%",
                    textAlign: "end",
                    display: "inline-block",
                    zIndex: 1,
                  }}
                >
                  {formatSettingValue(filmSim.settings.whiteBalance)}
                </span>
              </Box>
            )}
            {/* WB Shift pill */}
            {filmSim.settings?.wbShift && (
              <Box
                sx={{
                  width: "100%",
                  bgcolor: "grey.900",
                  color: "grey.100",
                  borderRadius: 2,
                  px: { xs: 2, sm: 3 },
                  py: { xs: 0.25, sm: 0.5 },
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  fontWeight: 600,
                  fontSize: { xs: "0.80rem", sm: "0.95rem" },
                  letterSpacing: 0.2,
                  minHeight: { xs: 22, sm: 30 },
                  mb: 2,
                }}
              >
                <span
                  style={{
                    opacity: 0.6,
                    width: "50%",
                    textAlign: "start",
                    display: "inline-block",
                    zIndex: 1,
                  }}
                >
                  WB Shift
                </span>
                <Box
                  sx={{
                    position: "absolute",
                    left: "50%",
                    top: 6,
                    bottom: 6,
                    height: "auto",
                    borderLeft: "1px solid #444",
                    transform: "translateX(-50%)",
                    zIndex: 2,
                  }}
                />
                <span
                  style={{
                    fontWeight: 700,
                    width: "50%",
                    textAlign: "end",
                    display: "inline-block",
                    zIndex: 1,
                  }}
                >
                  {`R${filmSim.settings.wbShift.r} / B${filmSim.settings.wbShift.b}`}
                </span>
              </Box>
            )}
            {/* WhiteBalanceGrid */}
            {filmSim.settings?.wbShift && (
              <Box
                sx={{
                  mt: { xs: 3, md: 0 },
                  px: 1,
                  mx: "auto",
                  display: "flex",
                  justifyContent: "center",
                  flexGrow: 1,
                  alignItems: "center",
                }}
              >
                <WhiteBalanceGrid
                  value={filmSim.settings.wbShift}
                  onChange={() => {}}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Sample images */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mt={4}
        mb={1}
      >
        <Typography variant="h6">Sample Images</Typography>
        {currentUser && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setAddPhotoDialogOpen(true)}
            size="small"
          >
            Add Photo
          </Button>
        )}
      </Box>
      {filmSim.sampleImages && filmSim.sampleImages.length > 0 ? (
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
          {filmSim.sampleImages.map(
            (image: { id: string; url: string; caption?: string }) => (
              <Box key={image.id}>
                <img
                  src={image.url}
                  alt={image.caption || `Sample image for ${filmSim.name}`}
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

      {/* Creator's Notes and Recommended Presets */}
      <Box sx={{ mt: 4 }}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ backgroundColor: "none" }}
          >
            <Typography variant="h6">Creator's Notes</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 2,
              }}
            >
              <Typography variant="body1" color="text.secondary">
                {filmSim.notes || "No notes provided."}
              </Typography>
              {filmSim.creator && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <img
                    src={filmSim.creator.avatar}
                    alt={filmSim.creator.username}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #eee",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/profile/${filmSim.creator.id}`)}
                  />
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/profile/${filmSim.creator.id}`)}
                  >
                    {filmSim.creator.username}
                  </Typography>
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ backgroundColor: "none" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Typography variant="h6">Recommended Presets</Typography>
              {currentUser &&
                filmSim.creator &&
                currentUser.id === filmSim.creator.id && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <Box
                      component="span"
                      onClick={() => setRecommendedPresetsDialogOpen(true)}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        px: 2,
                        py: 0.5,
                        border: "1px solid",
                        borderColor: "primary.main",
                        borderRadius: 1,
                        color: "primary.main",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        "&:hover": {
                          backgroundColor: "primary.main",
                          color: "white",
                        },
                        ml: 2,
                      }}
                    >
                      Manage
                    </Box>
                  </div>
                )}
            </div>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "repeat(3, 1fr)",
                },
                gap: 2,
              }}
            >
              {filmSim.recommendedPresets &&
              filmSim.recommendedPresets.length > 0 ? (
                filmSim.recommendedPresets.map(
                  (preset: {
                    id: string;
                    title: string;
                    slug: string;
                    description?: string;
                    afterImage?: { url: string };
                    creator?: { id: string; username: string; avatar?: string };
                    tags?: { id: string; displayName: string }[];
                  }) => (
                    <Box
                      key={preset.id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "background.default",
                        boxShadow: 1,
                        cursor: "pointer",
                        "&:hover": {
                          boxShadow: 2,
                          bgcolor: "action.hover",
                        },
                      }}
                      onClick={() => navigate(`/preset/${preset.slug}`)}
                    >
                      {preset.afterImage && (
                        <Box
                          sx={{
                            width: "100%",
                            height: 120,
                            borderRadius: 1,
                            overflow: "hidden",
                            mb: 1,
                          }}
                        >
                          <img
                            src={preset.afterImage.url}
                            alt={preset.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                      )}
                      <Typography variant="h6" gutterBottom>
                        {preset.title}
                      </Typography>
                      {preset.creator && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          by {preset.creator.username}
                        </Typography>
                      )}
                      {preset.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {preset.description}
                        </Typography>
                      )}
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {preset.tags?.map(
                          (tag: { id: string; displayName: string }) => (
                            <Chip
                              key={tag.id}
                              label={tag.displayName}
                              size="small"
                              variant="outlined"
                            />
                          )
                        )}
                      </Stack>
                    </Box>
                  )
                )
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recommended presets available.
                </Typography>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Discussion Thread */}
      <Divider sx={{ my: 4 }} />
      <DiscussionThread
        itemId={filmSim.id}
        itemType="filmsim"
        itemTitle={filmSim.name}
        itemSlug={filmSim.slug}
        itemThumbnail={filmSim.thumbnail}
        isEmbedded={true}
        showPreviewOnly={true}
        minimalHeader={true}
      />

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={window.innerWidth < 768}
        PaperProps={{
          sx: {
            backgroundColor: "background.paper",
            maxHeight: window.innerWidth < 768 ? "100vh" : "90vh",
            height: window.innerWidth < 768 ? "100vh" : "auto",
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h4" gutterBottom>
            Edit Film Simulation
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ overflowY: "auto", pb: 2 }}>
          <Box component="form" sx={{ mt: 2 }}>
            <Stack spacing={3}>
              <TextField
                label="Name"
                defaultValue={filmSim.name}
                fullWidth
                required
              />

              <TextField
                label="Description"
                multiline
                minRows={3}
                defaultValue={filmSim.description || ""}
                fullWidth
              />

              <TextField
                label="Creator Notes"
                multiline
                minRows={3}
                defaultValue={filmSim.notes || ""}
                fullWidth
              />

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Tags (comma-separated)
                </Typography>
                <TextField
                  fullWidth
                  defaultValue={
                    filmSim.tags
                      ?.map((tag: { displayName: string }) => tag.displayName)
                      .join(", ") || ""
                  }
                  placeholder="e.g., portrait, landscape, street"
                />
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Compatible Cameras (comma-separated)
                </Typography>
                <TextField
                  fullWidth
                  defaultValue={filmSim.compatibleCameras?.join(", ") || ""}
                  placeholder="e.g., X-T4, X-T5, X-H2"
                />
              </Box>

              {/* Film Simulation Type */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Film Simulation Type</InputLabel>
                <Select defaultValue={filmSim.type || "custom-recipe"} disabled>
                  <MenuItem value="custom-recipe">Custom Recipe</MenuItem>
                  <MenuItem value="fujifilm-native">Fujifilm Native</MenuItem>
                </Select>
              </FormControl>

              {/* Camera Settings */}
              <Paper sx={{ p: 3, mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Camera Settings
                </Typography>
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
                    { key: "filmSimulation", label: "Film Simulation" },
                    { key: "dynamicRange", label: "Dynamic Range" },
                    { key: "highlight", label: "Highlight Tone" },
                    { key: "shadow", label: "Shadow Tone" },
                    { key: "colour", label: "Colour" },
                    { key: "sharpness", label: "Sharpness" },
                    { key: "noiseReduction", label: "Noise Reduction" },
                    { key: "grainEffect", label: "Grain Effect" },
                    { key: "clarity", label: "Clarity" },
                    { key: "whiteBalance", label: "White Balance" },
                  ].map((setting) => (
                    <Box key={setting.key}>
                      <TextField
                        label={setting.label}
                        defaultValue={filmSim.settings?.[setting.key] || ""}
                        fullWidth
                      />
                    </Box>
                  ))}
                </Box>

                {/* WB Shift */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    White Balance Shift
                  </Typography>
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
                      <TextField
                        label="Red"
                        type="number"
                        defaultValue={filmSim.settings?.wbShift?.r || 0}
                        fullWidth
                      />
                    </Box>
                    <Box>
                      <TextField
                        label="Blue"
                        type="number"
                        defaultValue={filmSim.settings?.wbShift?.b || 0}
                        fullWidth
                      />
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pb: window.innerWidth < 768 ? 4 : 2 }}>
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
        <DialogTitle id="delete-dialog-title">
          Delete Film Simulation
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{filmSim.name}"? This action cannot
            be undone and will permanently remove the film simulation and all
            associated images from the database.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteFilmSim}
            color="error"
            variant="contained"
            disabled={deletingFilmSim}
          >
            {deletingFilmSim ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
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
              Share a photo you've taken using the "{filmSim.name}" film
              simulation
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
              placeholder="Describe your photo or the settings you used..."
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

      {/* Recommended Presets Manager */}
      <RecommendedPresetsManager
        open={recommendedPresetsDialogOpen}
        onClose={() => setRecommendedPresetsDialogOpen(false)}
        filmSimId={filmSim.id}
        filmSimName={filmSim.name}
        currentRecommendedPresets={filmSim.recommendedPresets || []}
      />
    </Container>
  );
};

export default FilmSimDetails;
