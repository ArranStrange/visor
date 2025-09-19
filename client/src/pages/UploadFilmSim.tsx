import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Box,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { useImageUpload } from "../hooks/useImageUpload";

import FilmSimSettingsForm from "../components/FilmSimSettingsForm";
import FilmSimTagsInput from "../components/FilmSimTagsInput";
import ImageUpload from "../components/ImageUpload";

import { FilmSimFormState, FilmSimSettings } from "../types/filmSim";
import { DEFAULT_FILM_SIM_SETTINGS } from "../constants/filmSimConfig";

const UPLOAD_FILM_SIM = gql`
  mutation UploadFilmSim(
    $name: String!
    $description: String
    $settings: FilmSimSettingsInput!
    $notes: String
    $tags: [String!]!
    $sampleImages: [SampleImageInput!]
  ) {
    uploadFilmSim(
      name: $name
      description: $description
      settings: $settings
      notes: $notes
      tags: $tags
      sampleImages: $sampleImages
    ) {
      id
      name
      slug
    }
  }
`;

const UploadFilmSim: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploadFilmSim] = useMutation(UPLOAD_FILM_SIM);

  const [formState, setFormState] = useState<FilmSimFormState>({
    title: "",
    description: "",
    tags: [],
    tagInput: "",
    sampleImages: [],
    uploadedImageUrls: [],
    notes: "",
    settings: DEFAULT_FILM_SIM_SETTINGS as FilmSimSettings,
  });

  const { isUploading, fileError, setFileError, uploadImages } = useImageUpload(
    {
      uploadPreset: "FilmSimSamples",
      folder: "filmsims",
    }
  );

  const [errors, setErrors] = useState<string[]>([]);

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && formState.tagInput.trim()) {
      e.preventDefault();
      const newTag = formState.tagInput.trim().toLowerCase();
      if (!formState.tags.includes(newTag)) {
        setFormState((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
          tagInput: "",
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setFileError(null);

    if (!user) return;

    const validationErrors: string[] = [];
    if (!formState.title.trim()) validationErrors.push("Name is required");
    if (!formState.tags.length)
      validationErrors.push("Please add at least one tag");
    if (!formState.uploadedImageUrls.length)
      validationErrors.push("Please add at least one sample image");

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const variables = {
        name: formState.title,
        description: formState.description,
        settings: {
          dynamicRange: formState.settings.dynamicRange,
          filmSimulation: formState.settings.filmSimulation,
          whiteBalance: formState.settings.whiteBalance,
          wbShift: {
            r: formState.settings.wbShift.r || 0,
            b: formState.settings.wbShift.b || 0,
          },
          color: formState.settings.color || 0,
          sharpness: formState.settings.sharpness || 0,
          highlight: formState.settings.highlight || 0,
          shadow: formState.settings.shadow || 0,
          noiseReduction: formState.settings.noiseReduction || 0,
          grainEffect: formState.settings.grainEffect,
          clarity: formState.settings.clarity || 0,
          colorChromeEffect: formState.settings.colorChromeEffect,
          colorChromeFxBlue: formState.settings.colorChromeFxBlue,
        },
        notes: formState.notes,
        tags: formState.tags.map((tag) => tag.toLowerCase()),
        sampleImages: formState.uploadedImageUrls.map((img) => ({
          publicId: img.publicId,
          url: img.url,
        })),
      };

      const result = await uploadFilmSim({ variables });

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      if (!result.data?.uploadFilmSim) {
        throw new Error("Failed to upload film simulation");
      }

      navigate(`/filmsim/${result.data.uploadFilmSim.slug}`);
    } catch (err) {
      console.error("Error uploading:", err);
      setErrors(["Failed to upload film simulation. Please try again."]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    uploadImages(files, (uploadedFiles, urls) => {
      setFormState((prev) => ({
        ...prev,
        sampleImages: [...prev.sampleImages, ...uploadedFiles],
        uploadedImageUrls: [...prev.uploadedImageUrls, ...urls],
      }));
    });
    e.target.value = ""; // Reset input
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Upload Film Simulation
        </Typography>

        {!user && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You must be logged in to upload a film simulation. Please log in to
            continue.
          </Alert>
        )}

        {(errors.length > 0 || fileError) && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => {
              setErrors([]);
              setFileError(null);
            }}
          >
            {errors.length > 0 ? errors.join(", ") : fileError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3} mt={3}>
            <TextField
              label="Name"
              value={formState.title}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, title: e.target.value }))
              }
              required
              disabled={!user}
              data-cy="film-sim-name-input"
            />

            <TextField
              label="Description"
              multiline
              minRows={3}
              value={formState.description}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              disabled={!user}
              data-cy="film-sim-description-input"
            />

            {user && (
              <FilmSimSettingsForm
                settings={formState.settings}
                onSettingChange={(settingKey, value) =>
                  setFormState((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, [settingKey]: value },
                  }))
                }
              />
            )}

            <FilmSimTagsInput
              tags={formState.tags}
              tagInput={formState.tagInput}
              onTagInputChange={(value) =>
                setFormState((prev) => ({ ...prev, tagInput: value }))
              }
              onTagKeyDown={handleTagKeyDown}
              onRemoveTag={(tag) =>
                setFormState((prev) => ({
                  ...prev,
                  tags: prev.tags.filter((t) => t !== tag),
                }))
              }
              disabled={!user}
            />

            <ImageUpload
              sampleImages={formState.sampleImages}
              uploadedImageUrls={formState.uploadedImageUrls}
              isUploading={isUploading}
              fileError={fileError}
              onImageChange={handleImageUpload}
              onRemoveImage={(index) =>
                setFormState((prev) => ({
                  ...prev,
                  sampleImages: prev.sampleImages.filter((_, i) => i !== index),
                  uploadedImageUrls: prev.uploadedImageUrls.filter(
                    (_, i) => i !== index
                  ),
                }))
              }
              disabled={!user}
              dataCy="film-sim-image-upload"
            />

            <TextField
              label="Creator Notes"
              multiline
              minRows={3}
              value={formState.notes}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, notes: e.target.value }))
              }
              disabled={!user}
              data-cy="film-sim-notes-input"
            />

            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={
                  isUploading ||
                  !user ||
                  formState.uploadedImageUrls.length === 0
                }
                startIcon={isUploading ? <CircularProgress size={20} /> : null}
                data-cy="film-sim-submit-button"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default UploadFilmSim;
