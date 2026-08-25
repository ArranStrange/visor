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
import { useNavigate } from "react-router-dom";

import PresetUploadForm from "../components/forms/PresetUploadForm";
import { usePresetUploadForm } from "../hooks/usePresetUploadForm";
import {
  buildSettingsForBackend,
  buildToneCurveForBackend,
} from "../utils/presetSettingsTransform";
import { uploadXmpToCloudinary } from "../utils/presetUploadUtils";
import {
  UPLOAD_PRESET,
  type UploadPresetMutationData,
  type UploadPresetMutationVariables,
} from "../graphql/presets";

const UploadPreset: React.FC = () => {
  const navigate = useNavigate();
  const [uploadPreset] = useMutation<
    UploadPresetMutationData,
    UploadPresetMutationVariables
  >(UPLOAD_PRESET);

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

      // Store the original .xmp so settings can always be re-derived.
      let xmpUrl: string | null = null;
      if (formState.xmpFile) {
        try {
          xmpUrl = await uploadXmpToCloudinary(formState.xmpFile);
        } catch (error) {
          console.error("Error uploading XMP file:", error);
        }
      }

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
          xmpUrl,
        },
      });

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      if (!result.data?.uploadPreset) {
        throw new Error("Failed to upload preset: No data returned");
      }

      navigate(`/preset/${result.data.uploadPreset.slug}`);
    } catch (error) {
      console.error("Error uploading:", error);
      setError(
        error instanceof Error ? error.message : "Failed to upload preset"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isUploading || isSubmitting;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
