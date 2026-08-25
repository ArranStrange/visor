import React, { useState } from "react";
import { Container, Typography, Paper, Alert } from "@mui/material";
import { ApolloError, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { useImageUpload } from "@/features/film-sims/hooks/useImageUpload";

import UploadFilmSimForm from "./UploadFilmSimForm";
import { buildFilmSimVariables } from "./buildFilmSimVariables";

import { FilmSimFormState, FilmSimSettings } from "@/features/film-sims/types/filmSim";
import { FilmSimFormField, FilmSimFormValue } from "@/features/film-sims/hooks/useFilmSimForm";
import { DEFAULT_FILM_SIM_SETTINGS } from "@/features/film-sims/utils/filmSimConfig";
import {
  UPLOAD_FILM_SIM,
  type UploadFilmSimMutationData,
  type UploadFilmSimMutationVariables,
} from "@/features/film-sims/graphql/filmSims";

const UploadFilmSim: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploadFilmSim] = useMutation<
    UploadFilmSimMutationData,
    UploadFilmSimMutationVariables
  >(UPLOAD_FILM_SIM);

  const [formState, setFormState] = useState<FilmSimFormState>({
    title: "",
    description: "",
    tags: [],
    tagInput: "",
    compatibleSensors: [],
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

        <UploadFilmSimForm
          formState={formState}
          isLoggedIn={!!user}
          isUploading={isUploading}
          fileError={fileError}
          errors={errors}
          onSubmit={handleSubmit}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          onSettingChange={handleSettingChange}
          onTagInputChange={handleTagInputChange}
          onTagKeyDown={handleTagKeyDown}
          onRemoveTag={handleRemoveTag}
          onCompatibleSensorsChange={handleCompatibleSensorsChange}
          onImageUpload={handleImageUpload}
          onRemoveImage={handleRemoveImage}
          onNotesChange={handleNotesChange}
          onClearErrors={handleClearErrors}
        />
      </Paper>
    </Container>
  );

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormState((prev) => ({ ...prev, title: e.target.value }));
  }

  function handleDescriptionChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setFormState((prev) => ({ ...prev, description: e.target.value }));
  }

  function handleSettingChange(
    settingKey: FilmSimFormField,
    value: FilmSimFormValue
  ) {
    if (settingKey.startsWith("settings.")) {
      const actualKey = settingKey.replace("settings.", "");
      setFormState((prev) => ({
        ...prev,
        settings: { ...prev.settings, [actualKey]: value },
      }));
    } else {
      setFormState((prev) => ({
        ...prev,
        settings: { ...prev.settings, [settingKey]: value },
      }));
    }
  }

  function handleTagInputChange(value: string) {
    setFormState((prev) => ({ ...prev, tagInput: value }));
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
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
  }

  function handleRemoveTag(tag: string) {
    setFormState((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  }

  function handleCompatibleSensorsChange(value: string[]) {
    setFormState((prev) => ({ ...prev, compatibleSensors: value }));
  }

  function handleNotesChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setFormState((prev) => ({ ...prev, notes: e.target.value }));
  }

  function handleClearErrors() {
    setErrors([]);
    setFileError(null);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    uploadImages(files, (uploadedFiles, urls) => {
      setFormState((prev) => ({
        ...prev,
        sampleImages: [...prev.sampleImages, ...uploadedFiles],
        uploadedImageUrls: [...prev.uploadedImageUrls, ...urls],
      }));
    });
    e.target.value = "";
  }

  function handleRemoveImage(index: number) {
    setFormState((prev) => ({
      ...prev,
      sampleImages: prev.sampleImages.filter((_, i) => i !== index),
      uploadedImageUrls: prev.uploadedImageUrls.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
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
      const variables = buildFilmSimVariables(formState);
      const result = await uploadFilmSim({ variables });

      if (result.errors) {
        throw new ApolloError({ graphQLErrors: result.errors });
      }
      if (!result.data?.uploadFilmSim) {
        throw new Error("Failed to upload film simulation");
      }

      navigate(`/filmsim/${result.data.uploadFilmSim.slug}`);
    } catch (err) {
      console.error("Error uploading:", err);
      setErrors(["Failed to upload film simulation. Please try again."]);
    }
  }
};

export default UploadFilmSim;
