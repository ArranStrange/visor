import React from "react";
import {
  TextField,
  Button,
  Stack,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import FilmSimSettingsForm from "@/features/film-sims/components/FilmSimSettingsForm";
import FilmSimTagsInput from "@/features/film-sims/components/FilmSimTagsInput";
import ImageUpload from "../../components/media/ImageUpload";
import CompatibleSensorsField from "./CompatibleSensorsField";
import SensorWarningsList from "./SensorWarningsList";
import { FilmSimFormState } from "@/features/film-sims/types/filmSim";
import type { FilmSimFormChangeHandler } from "@/features/film-sims/hooks/useFilmSimForm";

interface UploadFilmSimFormProps {
  formState: FilmSimFormState;
  isLoggedIn: boolean;
  isUploading: boolean;
  fileError: string | null;
  errors: string[];
  onSubmit: (e: React.FormEvent) => void;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSettingChange: FilmSimFormChangeHandler;
  onTagInputChange: (value: string) => void;
  onTagKeyDown: (e: React.KeyboardEvent) => void;
  onRemoveTag: (tag: string) => void;
  onCompatibleSensorsChange: (value: string[]) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onNotesChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onClearErrors: () => void;
}

const UploadFilmSimForm: React.FC<UploadFilmSimFormProps> = ({
  formState,
  isLoggedIn,
  isUploading,
  fileError,
  errors,
  onSubmit,
  onTitleChange,
  onDescriptionChange,
  onSettingChange,
  onTagInputChange,
  onTagKeyDown,
  onRemoveTag,
  onCompatibleSensorsChange,
  onImageUpload,
  onRemoveImage,
  onNotesChange,
  onClearErrors,
}) => {
  return (
    <form onSubmit={onSubmit}>
      <Stack spacing={3} mt={3}>
        <TextField
          label="Name"
          value={formState.title}
          onChange={onTitleChange}
          required
          disabled={!isLoggedIn}
          data-cy="film-sim-name-input"
        />

        <TextField
          label="Description"
          multiline
          minRows={3}
          value={formState.description}
          onChange={onDescriptionChange}
          disabled={!isLoggedIn}
          data-cy="film-sim-description-input"
        />

        {isLoggedIn && (
          <FilmSimSettingsForm
            settings={formState.settings}
            onSettingChange={onSettingChange}
          />
        )}

        <FilmSimTagsInput
          tags={formState.tags}
          tagInput={formState.tagInput}
          onTagInputChange={onTagInputChange}
          onTagKeyDown={onTagKeyDown}
          onRemoveTag={onRemoveTag}
          disabled={!isLoggedIn}
        />

        <CompatibleSensorsField
          value={formState.compatibleSensors}
          onChange={onCompatibleSensorsChange}
          disabled={!isLoggedIn}
        />

        <SensorWarningsList
          compatibleSensors={formState.compatibleSensors}
          settings={formState.settings}
        />

        <ImageUpload
          sampleImages={formState.sampleImages}
          uploadedImageUrls={formState.uploadedImageUrls}
          isUploading={isUploading}
          fileError={fileError}
          onImageChange={onImageUpload}
          onRemoveImage={onRemoveImage}
          disabled={!isLoggedIn}
          dataCy="film-sim-image-upload"
        />

        <TextField
          label="Creator Notes"
          multiline
          minRows={3}
          value={formState.notes}
          onChange={onNotesChange}
          disabled={!isLoggedIn}
          data-cy="film-sim-notes-input"
        />

        {(errors.length > 0 || fileError) && (
          <Alert severity="error" sx={{ mt: 3 }} onClose={onClearErrors}>
            {errors.length > 0 ? errors.join(", ") : fileError}
          </Alert>
        )}

        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={
              isUploading ||
              !isLoggedIn ||
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
  );
};

export default UploadFilmSimForm;
