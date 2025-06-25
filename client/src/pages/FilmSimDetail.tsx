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
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import { GET_FILMSIM_BY_SLUG } from "../graphql/queries/getFilmSimBySlug";
import { DELETE_FILMSIM } from "../graphql/mutations/deleteFilmSim";
import PresetCard from "../components/PresetCard";
import AddToListButton from "../components/AddToListButton";
import DiscussionThread from "../components/discussions/DiscussionThread";
import { useAuth } from "../context/AuthContext";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InstagramIcon from "@mui/icons-material/Instagram";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";

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
  const [fullscreenImage, setFullscreenImage] = React.useState<string | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const menuOpen = Boolean(menuAnchorEl);

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
                href={filmSim.creator.instagram}
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
        {filmSim.tags?.map((tag) => (
          <Chip key={tag.id} label={tag.displayName} variant="outlined" />
        ))}
        {filmSim.compatibleCameras?.map((camera) => (
          <Chip key={camera} label={camera} color="secondary" />
        ))}
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Camera Settings */}
      <Typography variant="h6" mt={4} mb={2}>
        In-Camera Settings
      </Typography>
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
        {[
          { label: "Dynamic Range", value: filmSim.settings?.dynamicRange },
          { label: "Highlight Tone", value: filmSim.settings?.highlight },
          { label: "Shadow Tone", value: filmSim.settings?.shadow },
          { label: "Colour", value: filmSim.settings?.colour },
          { label: "Sharpness", value: filmSim.settings?.sharpness },
          { label: "Noise Reduction", value: filmSim.settings?.noiseReduction },
          { label: "Grain Effect", value: filmSim.settings?.grainEffect },
          { label: "Clarity", value: filmSim.settings?.clarity },
          { label: "White Balance", value: filmSim.settings?.whiteBalance },
          {
            label: "WB Shift",
            value: filmSim.settings?.wbShift
              ? `R${formatSettingValue(
                  filmSim.settings.wbShift.r
                )} / B${formatSettingValue(filmSim.settings.wbShift.b)}`
              : "N/A",
          },
        ].map((setting) => (
          <Box
            key={setting.label}
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: "background.paper",
              boxShadow: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {setting.label}
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatSettingValue(setting.value)}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Sample images */}
      <Typography variant="h6" mt={4} mb={1}>
        Sample Images
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        {filmSim.sampleImages?.map((image) => (
          <Box key={image.id}>
            <img
              src={image.url}
              alt={image.caption || `Sample image for ${filmSim.name}`}
              style={{ width: "100%", borderRadius: 12, cursor: "pointer" }}
              onClick={() => setFullscreenImage(image.url)}
            />
          </Box>
        ))}
      </Box>

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
            <Typography variant="h6">Recommended Presets</Typography>
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
                filmSim.recommendedPresets.map((preset) => (
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
                    onClick={() =>
                      (window.location.href = `/preset/${preset.slug}`)
                    }
                  >
                    <Typography variant="h6" gutterBottom>
                      {preset.title}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {preset.tags?.map((tag) => (
                        <Chip
                          key={tag.id}
                          label={tag.displayName}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                ))
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
        PaperProps={{
          sx: {
            backgroundColor: "background.paper",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h4" gutterBottom>
            Edit Film Simulation
          </Typography>
        </DialogTitle>
        <DialogContent>
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
                    filmSim.tags?.map((tag) => tag.displayName).join(", ") || ""
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

              {/* Camera Settings */}
              <Paper sx={{ p: 3, mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Camera Settings
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 2,
                  }}
                >
                  {[
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
                      gridTemplateColumns: "1fr 1fr",
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
    </Container>
  );
};

export default FilmSimDetails;
