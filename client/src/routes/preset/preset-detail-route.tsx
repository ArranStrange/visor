import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_PRESET_BY_SLUG } from "@gql/queries/getPresetBySlug";
import { useAuth } from "context/AuthContext";
import { useFeatured } from "hooks/useFeatured";
import { downloadXMP, type PresetData } from "lib/utils/xmpCompiler";
import EditPresetDialog from "components/presets/dialogs/EditPresetDialog";
import DeletePresetDialog from "components/presets/dialogs/DeletePresetDialog";
import AddPhotoDialog from "components/presets/dialogs/AddPhotoDialog";
import FullscreenImageDialog from "components/presets/dialogs/FullscreenImageDialog";
import { usePresetOperations } from "hooks/usePresetOperations";
import { usePresetPhotos } from "hooks/usePresetPhotos";
import {
  PresetDetailToolbar,
  PresetDetailSection,
  PageBreadcrumbs,
} from "lib/slots/slot-definitions";
import {
  PresetEditRequested,
  PresetDeleteRequested,
  PresetSaved,
  PresetDeleted,
  MenuOpen,
  MenuClose,
  ImageClick,
  AddPhotoDialogOpen,
  DownloadRequested,
  NavigateTo,
} from "lib/events/event-definitions";
import PresetBreadcrumb from "./preset-detail.runtime";

const PresetDetails: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { isAdmin } = useFeatured();
  const { loading, error, data, refetch } = useQuery(GET_PRESET_BY_SLUG, {
    variables: { slug },
  });

  const preset = data?.getPreset;

  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    parsedSettings,
    editFormData,
    setEditFormData,
    saveError,
    saveSuccess,
    deletingPreset,
    updatingPreset,
    handleEdit,
    handleDelete,
    handleDeletePreset,
    handleToggleFeatured,
    handleSettingsParsed,
    handleSavePreset,
  } = usePresetOperations(preset || { id: "", slug: "", title: "", tags: [] });

  const {
    addPhotoDialogOpen,
    setAddPhotoDialogOpen,
    photoFile,
    photoCaption,
    setPhotoCaption,
    uploadingPhoto,
    fullscreenImage,
    setFullscreenImage,
    currentImageId,
    currentImageFeatured,
    handlePhotoFileChange,
    handlePhotoUpload,
    handleImageClick,
    handleToggleFeaturedPhoto,
  } = usePresetPhotos(preset?.id || "");

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);

  // Listen to menu events
  MenuOpen.useEvent(
    (data) => {
      if (data?.menuId === "preset-menu") {
        setMenuAnchorEl(data.anchorEl);
      }
    },
    []
  );

  MenuClose.useEvent(
    (data) => {
      if (data?.menuId === "preset-menu") {
        setMenuAnchorEl(null);
      }
    },
    []
  );

  // Listen to preset edit/delete requests
  PresetEditRequested.useEvent(
    (data) => {
      if (data?.presetId === preset?.id || data?.preset?.id === preset?.id) {
        handleEdit();
      }
    },
    [preset?.id]
  );

  PresetDeleteRequested.useEvent(
    (data) => {
      if (data?.presetId === preset?.id || data?.preset?.id === preset?.id) {
        handleDelete();
      }
    },
    [preset?.id]
  );

  // Listen to preset saved/deleted events
  PresetSaved.useEvent(
    (data) => {
      if (data?.presetId === preset?.id || data?.preset?.id === preset?.id) {
        refetch();
      }
    },
    [preset?.id, refetch]
  );

  PresetDeleted.useEvent(() => {
    navigate("/");
  }, [navigate]);

  // Listen to image click events
  ImageClick.useEvent(
    (data) => {
      if (preset?.id && data) {
        handleImageClick(data.imageId, data.imageUrl, data.featured);
      }
    },
    [preset?.id]
  );

  // Listen to add photo dialog open
  AddPhotoDialogOpen.useEvent(
    (data) => {
      if (data?.itemType === "preset" && data?.itemId === preset?.id) {
        setAddPhotoDialogOpen(true);
      }
    },
    [preset?.id]
  );

  // Listen to download requests
  DownloadRequested.useEvent(
    (data) => {
      if (data?.itemType === "preset" && data?.itemId === preset?.id && preset) {
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
          whiteBalance: "Custom",
          cameraProfile: "Adobe Standard",
          profileName: "Adobe Standard",
          version: "15.0",
          processVersion: "15.0",
          creator: preset.creator?.username || "VISOR",
          dateCreated: preset.createdAt,
        };

        downloadXMP(presetData);
      }
    },
    [preset]
  );

  // Listen to navigation events
  NavigateTo.useEvent(
    (data) => {
      if (data?.path) {
        navigate(data.path);
      }
    },
    [navigate]
  );

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

  if (!preset) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Preset not found</Alert>
      </Container>
    );
  }

  const isOwner =
    currentUser && preset.creator && currentUser.id === preset.creator.id;

  return (
    <Container maxWidth="md" sx={{ my: 4, position: "relative" }}>
      {/* Breadcrumbs - plugins can inject breadcrumb navigation here */}
      <PresetBreadcrumb />
      <PageBreadcrumbs.Slot />

      {/* Toolbar - plugins can inject actions here */}
      <PresetDetailToolbar.Slot
        preset={preset}
        isOwner={!!isOwner}
        isAdmin={isAdmin}
        menuAnchorEl={menuAnchorEl}
        menuOpen={menuOpen}
      />

      {/* Sections - plugins can inject content sections here */}
      <PresetDetailSection.Slot
        preset={preset}
        isOwner={!!isOwner}
        currentUser={currentUser}
      />

      <EditPresetDialog
        open={editDialogOpen}
        formData={editFormData}
        parsedSettings={parsedSettings}
        saveError={saveError}
        saveSuccess={saveSuccess}
        updating={updatingPreset}
        currentSettings={preset.settings}
        presetEffects={preset.effects || {}}
        onClose={() => setEditDialogOpen(false)}
        onFormDataChange={setEditFormData}
        onSettingsParsed={handleSettingsParsed}
        onSave={handleSavePreset}
      />

      <DeletePresetDialog
        open={deleteDialogOpen}
        presetTitle={preset.title}
        deleting={deletingPreset}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeletePreset}
      />

      <AddPhotoDialog
        open={addPhotoDialogOpen}
        presetTitle={preset.title}
        photoFile={photoFile}
        photoCaption={photoCaption}
        uploading={uploadingPhoto}
        onClose={() => setAddPhotoDialogOpen(false)}
        onFileChange={handlePhotoFileChange}
        onCaptionChange={setPhotoCaption}
        onUpload={handlePhotoUpload}
      />

      <FullscreenImageDialog
        open={!!fullscreenImage}
        imageUrl={fullscreenImage}
        isFeatured={currentImageFeatured}
        showFeaturedToggle={isAdmin && !!currentImageId}
        onClose={() => setFullscreenImage(null)}
        onFeaturedToggle={handleToggleFeaturedPhoto}
      />
    </Container>
  );
};

export default PresetDetails;
