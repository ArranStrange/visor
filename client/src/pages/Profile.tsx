import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Link,
} from "@mui/material";
import { useQuery, useMutation } from "@apollo/client";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { uploadToCloudinary } from "../utils/cloudinary";
import { GET_USER_PROFILE, UPDATE_USER_PROFILE } from "@/features/auth/graphql/users";
import ProfileHeader from "@/features/profile/components/ProfileHeader";
import ProfileEditForm from "@/features/profile/components/ProfileEditForm";
import { getErrorMessage } from "../utils/errorHandling";

// File validation
const validateProfileImage = (file: File): boolean => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return false;
  }

  if (file.size > maxSize) {
    return false;
  }

  return true;
};

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    instagram: "",
    cameras: [] as string[],
  });
  const [newCamera, setNewCamera] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const { updateUser } = useAuth();

  const {
    loading,
    error: queryError,
    data,
    refetch,
  } = useQuery(GET_USER_PROFILE, {
    onCompleted: (result) => {
      if (result?.getCurrentUser) {
        const user = result.getCurrentUser;
        setFormData({
          bio: user.bio || "",
          instagram: user.instagram || "",
          cameras: Array.isArray(user.cameras) ? user.cameras : [],
        });
      }
    },
  });

  const [updateProfile] = useMutation(UPDATE_USER_PROFILE, {
    onCompleted: () => {
      setSuccess("Profile updated successfully!");
      refetch();
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (mutationError) => {
      console.error("Profile update error:", mutationError);
      setError(getErrorMessage(mutationError));
      setTimeout(() => setError(null), 3000);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCamera = () => {
    if (newCamera.trim() && !formData.cameras.includes(newCamera.trim())) {
      setFormData((prev) => ({
        ...prev,
        cameras: [...prev.cameras, newCamera.trim()],
      }));
      setNewCamera("");
    }
  };

  const handleRemoveCamera = (camera: string) => {
    setFormData((prev) => ({
      ...prev,
      cameras: prev.cameras.filter((c) => c !== camera),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const inputData = {
        bio: formData.bio,
        instagram: formData.instagram,
        cameras: formData.cameras,
      };

      await updateProfile({
        variables: {
          input: JSON.stringify(inputData),
        },
      });
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const handleAvatarChange = async (file: File) => {
    setAvatarError(null);

    if (!validateProfileImage(file)) {
      setAvatarError(
        "Please select a valid image file (JPEG, PNG, WebP) under 5MB"
      );
      return;
    }

    try {
      setIsUploadingAvatar(true);

      // Upload to Cloudinary first
      const { url: cloudinaryUrl } = await uploadToCloudinary(file, {
        uploadPreset: "ProfilePhotos",
      });

      // Then update the user's avatar in the database
      await updateProfile({
        variables: {
          input: JSON.stringify({
            avatar: cloudinaryUrl,
          }),
        },
      });

      // Update the AuthContext with the new avatar URL
      updateUser({ avatar: cloudinaryUrl });
    } catch (uploadError) {
      console.error("Error uploading avatar:", uploadError);
      setAvatarError("Failed to upload profile picture");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (loading && !data) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (queryError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading profile: {getErrorMessage(queryError)}
        </Alert>
      </Container>
    );
  }

  const user = data?.getCurrentUser;

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 4,
        mb: 4,
        px: { xs: 1, sm: 2, md: 3 },
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 2,
        }}
      >
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <ProfileHeader
              avatarUrl={user?.avatar}
              avatarAlt={user?.username}
              onAvatarChange={handleAvatarChange}
              avatarUploading={isUploadingAvatar}
              avatarError={avatarError}
            >
              <Typography variant="h5" fontWeight="bold">
                {user?.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </ProfileHeader>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <ProfileEditForm
              bio={formData.bio}
              instagram={formData.instagram}
              cameras={formData.cameras}
              newCamera={newCamera}
              isEditing={isEditing}
              onFieldChange={handleInputChange}
              onNewCameraChange={setNewCamera}
              onAddCamera={handleAddCamera}
              onRemoveCamera={handleRemoveCamera}
              onSubmit={handleSubmit}
              onStartEdit={() => setIsEditing(true)}
              onCancelEdit={() => setIsEditing(false)}
            />

            <Box sx={{ mt: 3 }}>
              <Link component={RouterLink} to="/settings/account">
                Password, email and account deletion
              </Link>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile;
