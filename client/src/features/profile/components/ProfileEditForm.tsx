import React from "react";
import { Box, Typography, TextField, Button, Stack, Autocomplete } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import {
  FUJIFILM_CAMERAS,
  normalizeCameraName,
} from "@/constants/fujifilmCameras";
import CameraChips from "@/features/profile/components/CameraChips";

// Suggestions for the camera input; freeSolo still allows any other gear.
const CAMERA_SUGGESTIONS = FUJIFILM_CAMERAS.map(
  (camera) => `Fujifilm ${camera.name}`
);

// Hyphen/space-insensitive suggestion matching, so "xt5" finds "Fujifilm X-T5".
const filterCameraSuggestions = (options: string[], inputValue: string) => {
  const needle = normalizeCameraName(inputValue);
  if (!needle) return options;
  return options.filter((option) =>
    normalizeCameraName(option).includes(needle)
  );
};

export interface ProfileEditFormProps {
  bio: string;
  instagram: string;
  cameras: string[];
  newCamera: string;
  isEditing: boolean;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewCameraChange: (value: string) => void;
  onAddCamera: () => void;
  onRemoveCamera: (camera: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  bio,
  instagram,
  cameras,
  newCamera,
  isEditing,
  onFieldChange,
  onNewCameraChange,
  onAddCamera,
  onRemoveCamera,
  onSubmit,
  onStartEdit,
  onCancelEdit,
}) => (
  <Box component="form" onSubmit={onSubmit}>
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Bio
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          name="bio"
          value={bio}
          onChange={onFieldChange}
          disabled={!isEditing}
          placeholder="Tell us about yourself..."
        />
      </Box>

      <Box>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Instagram
        </Typography>
        <TextField
          fullWidth
          name="instagram"
          value={instagram}
          onChange={onFieldChange}
          disabled={!isEditing}
          placeholder="@username"
          InputProps={{
            startAdornment: (
              <InstagramIcon sx={{ mr: 1, color: "text.secondary" }} />
            ),
          }}
        />
      </Box>

      <Box>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Cameras
        </Typography>
        <Box display="flex" gap={1} mb={2}>
          <Autocomplete
            fullWidth
            freeSolo
            options={CAMERA_SUGGESTIONS}
            filterOptions={(options, state) =>
              filterCameraSuggestions(options, state.inputValue)
            }
            inputValue={newCamera}
            onInputChange={(_, value) => onNewCameraChange(value)}
            disabled={!isEditing}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Add a camera"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <CameraAltIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            )}
          />
          <Button
            variant="contained"
            onClick={onAddCamera}
            disabled={!isEditing || !newCamera.trim()}
          >
            Add
          </Button>
        </Box>
        <CameraChips
          cameras={cameras}
          onRemove={isEditing ? onRemoveCamera : undefined}
        />
      </Box>

      <Box display="flex" gap={2} justifyContent="flex-end">
        {isEditing ? (
          <>
            <Button variant="outlined" onClick={onCancelEdit}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Save Changes
            </Button>
          </>
        ) : (
          <Button variant="contained" onClick={onStartEdit}>
            Edit Profile
          </Button>
        )}
      </Box>
    </Stack>
  </Box>
);

export default ProfileEditForm;
