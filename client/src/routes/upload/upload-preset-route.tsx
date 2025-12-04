import React from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { PageBreadcrumbs } from "lib/slots/slot-definitions";
import UploadPresetBreadcrumb from "./upload-preset.runtime";

import PresetUploadForm from "components/forms/PresetUploadForm";
import { usePresetUploadForm } from "hooks/usePresetUploadForm";
import {
  buildSettingsForBackend,
  buildToneCurveForBackend,
} from "lib/utils/presetSettingsTransform";

const UPLOAD_PRESET = gql`
  mutation UploadPreset(
    $title: String!
    $description: String
    $settings: PresetSettingsInput!
    $toneCurve: ToneCurveInput
    $notes: String
    $tags: [String!]!
    $beforeImage: ImageInput
    $afterImage: ImageInput
    $sampleImages: [ImageInput!]
  ) {
    uploadPreset(
      title: $title
      description: $description
      settings: $settings
      toneCurve: $toneCurve
      notes: $notes
      tags: $tags
      beforeImage: $beforeImage
      afterImage: $afterImage
      sampleImages: $sampleImages
    ) {
      id
      title
      slug
    }
  }
`;

const UploadPreset: React.FC = () => {
  const navigate = useNavigate();
  const [uploadPreset] = useMutation(UPLOAD_PRESET);

  const {
    formState,
    error,
    setError,
    fileError,
    setFileError,
    isUploading,
    handleTagKeyDown,
    handleBeforeImageChange,
    handleAfterImageChange,
    handleSettingsParsed,
    updateTitle,
    updateDescription,
    updateTagInput,
    removeTag,
    updateNotes,
  } = usePresetUploadForm();

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.parsedSettings) {
      setError("Please upload an XMP file first");
      return;
    }

    if (!formState.title.trim()) {
      setError("Title is required");
      return;
    }

    if (formState.tags.length === 0) {
      setError("At least one tag is required");
      return;
    }

    if (!formState.uploadedBeforeImage || !formState.uploadedAfterImage) {
      setError("Both before and after images are required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const settings = buildSettingsForBackend(formState.parsedSettings);
      const toneCurve = buildToneCurveForBackend(formState.parsedSettings);

      const { colorGrading, ...settingsWithoutColorGrading } = settings;

      const result = await uploadPreset({
        variables: {
          title: formState.title,
          description: formState.description,
          settings: settingsWithoutColorGrading,
          toneCurve,
          colorGrading,
          notes: formState.notes,
          tags: formState.tags.map((tag) => tag.toLowerCase()),
          beforeImage: formState.uploadedBeforeImage,
          afterImage: formState.uploadedAfterImage,
          sampleImages: [],
        },
      });

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      if (!result.data?.uploadPreset) {
        throw new Error("Failed to upload preset: No data returned");
      }

      navigate(`/preset/${result.data.uploadPreset.slug}`);
    } catch (error: any) {
      console.error("Error uploading:", error);
      setError(error.message || "Failed to upload preset");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isUploading || isSubmitting;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <UploadPresetBreadcrumb />
      <PageBreadcrumbs.Slot />
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Upload Preset
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mt: 3 }}>
            <PresetUploadForm
              title={formState.title}
              description={formState.description}
              tags={formState.tags}
              tagInput={formState.tagInput}
              beforeImage={formState.beforeImage}
              afterImage={formState.afterImage}
              notes={formState.notes}
              parsedSettings={formState.parsedSettings}
              onTitleChange={updateTitle}
              onDescriptionChange={updateDescription}
              onTagInputChange={updateTagInput}
              onTagKeyDown={handleTagKeyDown}
              onRemoveTag={removeTag}
              onBeforeImageChange={handleBeforeImageChange}
              onAfterImageChange={handleAfterImageChange}
              onNotesChange={updateNotes}
              onSettingsParsed={handleSettingsParsed}
            />

            {(error || fileError) && (
              <Alert
                severity="error"
                sx={{ mt: 3 }}
                onClose={() => {
                  setError(null);
                  setFileError(null);
                }}
              >
                {error || fileError}
              </Alert>
            )}

            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
                data-cy="preset-submit-button"
              >
                {isLoading ? "Uploading..." : "Upload"}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default UploadPreset;
