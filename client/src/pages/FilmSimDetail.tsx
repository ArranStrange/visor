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
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GET_FILMSIM_BY_SLUG } from "../graphql/queries/getFilmSimBySlug";
import { DELETE_FILMSIM } from "../graphql/mutations/deleteFilmSim";
import AddToListButton from "../components/ui/AddToListButton";
import DiscussionThread from "../components/discussions/DiscussionThread";
import FilmSimCameraSettings from "../components/forms/FilmSimCameraSettings";
import EditFilmSimDialog from "../components/dialogs/EditFilmSimDialog";
import RecommendedPresetsManager from "../components/cards/RecommendedPresetsManager";
import { useAuth } from "../context/AuthContext";
import { useFeatured } from "../hooks/useFeatured";

import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InstagramIcon from "@mui/icons-material/Instagram";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const FilmSimDetails: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { isAdmin, toggleFilmSimFeatured } = useFeatured();
  const { loading, error, data, refetch } = useQuery(GET_FILMSIM_BY_SLUG, {
    variables: { slug },
  });
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
  const [recommendedPresetsDialogOpen, setRecommendedPresetsDialogOpen] =
    React.useState(false);

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

  const handleToggleFeatured = async () => {
    handleMenuClose();
    try {
      await toggleFilmSimFeatured(filmSim.id, filmSim.featured);
      refetch(); // Refresh the data to show updated featured status
    } catch (error) {
      console.error("Error toggling featured status:", error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: "relative" }}>
      <AddToListButton filmSimId={filmSim.id} itemName={filmSim.name} />

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
              data-cy="film-sim-menu-button"
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          )}
      </Box>

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
            {isAdmin && (
              <MenuItem onClick={handleToggleFeatured}>
                <ListItemIcon>
                  {filmSim.featured ? (
                    <StarIcon fontSize="small" sx={{ color: "#FFD700" }} />
                  ) : (
                    <StarBorderIcon fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    filmSim.featured ? "Remove from featured" : "Make featured"
                  }
                />
              </MenuItem>
            )}
            <MenuItem
              onClick={handleDelete}
              data-cy="film-sim-delete-menu-item"
            >
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

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          mb: 2,
          "& > *": {
            marginBottom: 1,
          },
        }}
      >
        {filmSim.tags
          ?.filter((tag: any) => tag && tag.id)
          .map((tag: { id: string; displayName: string }) => (
            <Chip
              key={tag.id}
              label={tag?.displayName || "Unknown"}
              variant="outlined"
            />
          ))}
        {filmSim.compatibleCameras?.map((camera: string) => (
          <Chip key={camera} label={camera} color="secondary" />
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      <FilmSimCameraSettings settings={filmSim.settings} />

      <Divider sx={{ my: 2 }} />

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
            size="small"
            disabled={true}
            title="Photo upload feature coming soon"
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

      <Divider sx={{ my: 4 }} />
      <DiscussionThread
        itemId={filmSim.id}
        itemType="filmsim"
        itemTitle={filmSim.name}
        itemSlug={filmSim.slug}
        itemThumbnail={filmSim.thumbnail}
        isEmbedded={true}
        showPreviewOnly={false}
        minimalHeader={true}
      />

      <EditFilmSimDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        filmSim={filmSim}
        onSuccess={() => refetch()}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        data-cy="film-sim-delete-dialog"
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
            data-cy="film-sim-delete-confirm-button"
          >
            {deletingFilmSim ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

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
