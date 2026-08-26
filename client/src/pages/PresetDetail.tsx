import React, { useState } from "react";
import {
  Box,
  Container,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import {
  ADD_PHOTO_TO_PRESET,
  GET_PRESET_BY_SLUG,
  type GetPresetQueryData,
  type GetPresetQueryVariables,
} from "@/features/presets/graphql/presets";
import { useAuth } from "../context/AuthContext";
import { useFeatured } from "../hooks/useFeatured";
import { downloadXMP, type PresetData } from "@/features/presets/utils/xmp-compiler";
import { convertPresetSettingsToParsedSettings } from "@/features/presets/utils/presetDetailUtils";
import { normalizeToneCurve } from "@/features/settings/utils/xmp-parser";
import AddToListButton from "@/features/lists/components/AddToListButton";
import XmpSettingsDisplay from "@/features/settings/components/XmpSettingsDisplay";
import DiscussionThread from "@/features/discussions/components/DiscussionThread";
import DetailHeader from "../components/content/DetailHeader";
import ContentActionsMenu from "../components/content/ContentActionsMenu";
import ReportDialog from "@/features/moderation/components/ReportDialog";
import DeleteContentDialog from "../components/content/DeleteContentDialog";
import PresetDescription from "@/features/presets/components/PresetDescription";
import PresetBeforeAfter from "@/features/presets/components/PresetBeforeAfter";
import PresetSampleImages from "@/features/presets/components/PresetSampleImages";
import PresetActions from "@/features/presets/components/PresetActions";
import PresetCreatorNotes from "@/features/presets/components/PresetCreatorNotes";
import EditPresetDialog from "@/features/presets/components/dialogs/EditPresetDialog";
import AddPhotoDialog from "@/features/presets/components/dialogs/AddPhotoDialog";
import FullscreenImageDialog from "@/features/presets/components/dialogs/FullscreenImageDialog";
import { usePresetOperations } from "@/features/presets/hooks/usePresetOperations";
import { useContentPhotos } from "../hooks/useContentPhotos";
import { getErrorMessage } from "../utils/errorHandling";

const PresetDetails: React.FC = () => {
  const { slug } = useParams();
  const { user: currentUser } = useAuth();
  const { isAdmin } = useFeatured();
  const { loading, error, data } = useQuery<
    GetPresetQueryData,
    GetPresetQueryVariables
  >(GET_PRESET_BY_SLUG, {
    variables: { slug: slug ?? "" },
    skip: !slug,
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
  } = useContentPhotos({
    contentId: preset?.id || "",
    addPhotoMutation: ADD_PHOTO_TO_PRESET,
    reloadOnFeaturedToggle: true,
  });

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleReport = () => {
    handleMenuClose();
    setReportDialogOpen(true);
  };

  const handleDownloadXMP = () => {
    if (!preset) return;

    const presetData: PresetData = {
      title: preset.title,
      description: preset.description || "",
      settings: preset.settings || {},
      toneCurve: {
        rgb: normalizeToneCurve(preset.toneCurve?.rgb, "points"),
        red: normalizeToneCurve(preset.toneCurve?.red, "points"),
        green: normalizeToneCurve(preset.toneCurve?.green, "points"),
        blue: normalizeToneCurve(preset.toneCurve?.blue, "points"),
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
          Error loading preset: {getErrorMessage(error)}
        </Alert>
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
  const beforeImage = preset.beforeImage?.url;
  const afterImage = preset.afterImage?.url;

  return (
    <Container maxWidth="md" sx={{ my: 4, position: "relative" }}>
      <AddToListButton presetId={preset.id} itemName={preset.title} />

      <DetailHeader
        creator={preset.creator}
        title={preset.title}
        featured={!!preset.featured}
        isAdmin={isAdmin}
        showMenu={!!currentUser}
        onFeaturedToggle={handleToggleFeatured}
        onMenuOpen={handleMenuOpen}
      />

      {/* Signed in only: reporting anonymously would be unattributable. */}
      {currentUser && (
        <ContentActionsMenu
          anchorEl={menuAnchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          isOwner={!!isOwner}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReport={handleReport}
        />
      )}

      <PresetDescription description={preset.description} tags={preset.tags} />

      <Divider sx={{ my: 3 }} />

      <PresetBeforeAfter beforeImage={beforeImage} afterImage={afterImage} />

      <Box
        sx={{
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: "background.default",
        }}
      >
        {preset.settings && (
          <XmpSettingsDisplay
            settings={convertPresetSettingsToParsedSettings(
              preset.settings,
              preset
            )}
          />
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      <PresetSampleImages
        afterImage={afterImage}
        presetTitle={preset.title}
        sampleImages={preset.sampleImages}
        onImageClick={handleImageClick}
        onAddPhotoClick={() => setAddPhotoDialogOpen(true)}
        showAddButton={!!currentUser}
      />

      <PresetActions
        isAuthenticated={!!currentUser}
        onDownload={handleDownloadXMP}
      />

      {preset.notes && (
        <PresetCreatorNotes notes={preset.notes} creator={preset.creator} />
      )}

      <Box mt={4}>
        <DiscussionThread
          itemId={preset.id}
          itemType="preset"
          itemTitle={preset.title}
          isEmbedded={true}
          showPreviewOnly={false}
          minimalHeader={true}
        />
      </Box>

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

      <DeleteContentDialog
        open={deleteDialogOpen}
        title="Delete Preset"
        description={`Are you sure you want to delete "${preset.title}"? This action cannot be undone and will permanently remove the preset and all associated images from the database.`}
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

      <ReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        targetType="PRESET"
        targetId={preset.id}
        targetName={preset.title}
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
