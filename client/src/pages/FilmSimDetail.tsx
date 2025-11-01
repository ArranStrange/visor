import React, { useState } from "react";
import {
  Container,
  Box,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_FILMSIM_BY_SLUG } from "../graphql/queries/getFilmSimBySlug";
import { useAuth } from "../context/AuthContext";
import { useFeatured } from "../hooks/useFeatured";
import AddToListButton from "../components/ui/AddToListButton";
import DiscussionThread from "../components/discussions/DiscussionThread";
import FilmSimCameraSettings from "../components/forms/FilmSimCameraSettings";
import EditFilmSimDialog from "../components/dialogs/EditFilmSimDialog";
import RecommendedPresetsManager from "../components/cards/RecommendedPresetsManager";
import FilmSimHeader from "../components/filmsims/FilmSimHeader";
import FilmSimDescription from "../components/filmsims/FilmSimDescription";
import FilmSimSampleImages from "../components/filmsims/FilmSimSampleImages";
import FilmSimCreatorNotes from "../components/filmsims/FilmSimCreatorNotes";
import FilmSimRecommendedPresets from "../components/filmsims/FilmSimRecommendedPresets";
import FilmSimOwnerMenu from "../components/filmsims/FilmSimOwnerMenu";
import DeleteFilmSimDialog from "../components/filmsims/dialogs/DeleteFilmSimDialog";
import FullscreenImageDialog from "../components/presets/dialogs/FullscreenImageDialog";
import { useFilmSimOperations } from "../hooks/useFilmSimOperations";
import { useFilmSimPhotos } from "../hooks/useFilmSimPhotos";

const FilmSimDetails: React.FC = () => {
  const { slug } = useParams();
  const { user: currentUser } = useAuth();
  const { isAdmin } = useFeatured();
  const { loading, error, data, refetch } = useQuery(GET_FILMSIM_BY_SLUG, {
    variables: { slug },
  });

  const filmSim = data?.getFilmSim;

  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    deletingFilmSim,
    handleEdit,
    handleDelete,
    handleDeleteFilmSim,
    handleToggleFeatured,
  } = useFilmSimOperations(filmSim || { id: "", name: "" }, refetch);

  const {
    fullscreenImage,
    setFullscreenImage,
    currentImageId,
    currentImageFeatured,
    handleImageClick,
    handleToggleFeaturedPhoto,
  } = useFilmSimPhotos();

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [recommendedPresetsDialogOpen, setRecommendedPresetsDialogOpen] =
    useState(false);

  const menuOpen = Boolean(menuAnchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleEditClick = () => {
    handleMenuClose();
    handleEdit();
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    handleDelete();
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
        <Alert severity="error">
          Error loading film simulation: {error.message}
        </Alert>
      </Container>
    );
  }

  if (!filmSim) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Film simulation not found</Alert>
      </Container>
    );
  }

  const isOwner =
    currentUser && filmSim.creator && currentUser.id === filmSim.creator.id;

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: "relative" }}>
      <AddToListButton filmSimId={filmSim.id} itemName={filmSim.name} />

      <FilmSimHeader
        creator={filmSim.creator}
        name={filmSim.name}
        featured={filmSim.featured}
        isAdmin={isAdmin}
        isOwner={!!isOwner}
        onFeaturedToggle={handleToggleFeatured}
        onMenuOpen={handleMenuOpen}
      />

      {isOwner && (
        <FilmSimOwnerMenu
          anchorEl={menuAnchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      <FilmSimDescription
        description={filmSim.description}
        tags={filmSim.tags}
        compatibleCameras={filmSim.compatibleCameras}
      />

      <Divider sx={{ my: 3 }} />

      <FilmSimCameraSettings settings={filmSim.settings} />

      <Divider sx={{ my: 2 }} />

      <FilmSimSampleImages
        filmSimName={filmSim.name}
        sampleImages={filmSim.sampleImages}
        onImageClick={handleImageClick}
        showAddButton={!!currentUser}
      />

      <FilmSimCreatorNotes notes={filmSim.notes} creator={filmSim.creator} />

      <FilmSimRecommendedPresets
        presets={filmSim.recommendedPresets}
        isOwner={!!isOwner}
        onManageClick={() => setRecommendedPresetsDialogOpen(true)}
      />

      <Divider sx={{ my: 4 }} />

      <DiscussionThread
        itemId={filmSim.id}
        itemType="filmsim"
        itemTitle={filmSim.name}
        isEmbedded={true}
        showPreviewOnly={false}
        minimalHeader={true}
      />

      <EditFilmSimDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        filmSim={filmSim}
        onSuccess={refetch}
      />

      <DeleteFilmSimDialog
        open={deleteDialogOpen}
        filmSimName={filmSim.name}
        deleting={deletingFilmSim}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteFilmSim}
      />

      <FullscreenImageDialog
        open={!!fullscreenImage}
        imageUrl={fullscreenImage}
        isFeatured={currentImageFeatured}
        showFeaturedToggle={isAdmin && !!currentImageId}
        onClose={() => setFullscreenImage(null)}
        onFeaturedToggle={handleToggleFeaturedPhoto}
      />

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
