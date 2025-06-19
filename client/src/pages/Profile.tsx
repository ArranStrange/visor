import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  Grid,
  Paper,
  IconButton,
  Chip,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import InstagramIcon from "@mui/icons-material/Instagram";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { gql } from "@apollo/client";
import { useAuth } from "../context/AuthContext";

// GraphQL query to get user profile
const GET_USER_PROFILE = gql`
  query GetUserProfile {
    getCurrentUser {
      id
      username
      email
      avatar
      bio
      instagram
      cameras
    }
  }
`;

// GraphQL mutation to update user profile
const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: JSON!) {
    updateProfile(input: $input) {
      id
      username
      email
      avatar
      bio
      instagram
      cameras
    }
  }
`;

// GraphQL mutation to upload avatar
const UPLOAD_AVATAR = gql`
  mutation UploadAvatar($file: Upload!) {
    uploadAvatar(file: $file)
  }
`;

// Cloudinary upload function for profile pictures
const uploadToCloudinary = async (file: File): Promise<string> => {
  console.log("Uploading profile picture to Cloudinary...");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ProfilePhotos");
  formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      }/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary upload error:", errorData);
      throw new Error(
        `Failed to upload image to Cloudinary: ${
          errorData.error?.message || "Unknown error"
        }`
      );
    }

    const data = await response.json();
    console.log("Cloudinary upload response:", data);

    return data.secure_url;
  } catch (error: any) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
};

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
  const navigate = useNavigate();
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
  const { updateAuth } = useAuth();

  const {
    loading,
    error: queryError,
    data,
    refetch,
  } = useQuery(GET_USER_PROFILE, {
    onCompleted: (data) => {
      console.log("Profile data received:", data);
      if (data?.getCurrentUser) {
        const user = data.getCurrentUser;
        console.log("User data:", user);
        setFormData({
          bio: user.bio || "",
          instagram: user.instagram || "",
          cameras: Array.isArray(user.cameras) ? user.cameras : [],
        });
      }
    },
  });

  const [updateProfile] = useMutation(UPDATE_USER_PROFILE, {
    onCompleted: (data) => {
      console.log("Profile update completed:", data);
      setSuccess("Profile updated successfully!");
      refetch();
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (error) => {
      console.error("Profile update error:", error);
      setError(error.message);
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
      console.log("Sending profile update data:", inputData);

      await updateProfile({
        variables: {
          input: JSON.stringify(inputData),
        },
      });
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);

    if (!validateProfileImage(file)) {
      setAvatarError(
        "Please select a valid image file (JPEG, PNG, WebP) under 5MB"
      );
      e.target.value = "";
      return;
    }

    try {
      setIsUploadingAvatar(true);

      // Upload to Cloudinary first
      const cloudinaryUrl = await uploadToCloudinary(file);
      console.log("Uploaded to Cloudinary:", cloudinaryUrl);

      // Then update the user's avatar in the database
      await updateProfile({
        variables: {
          input: JSON.stringify({
            avatar: cloudinaryUrl,
          }),
        },
      });

      // Update the AuthContext with the new avatar URL
      updateAuth({ avatar: cloudinaryUrl });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setAvatarError("Failed to upload profile picture");
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = ""; // Reset the input
    }
  };

  if (loading) {
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
          Error loading profile: {queryError.message}
        </Alert>
      </Container>
    );
  }

  const user = data?.getCurrentUser;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
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

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Grid container spacing={4}>
          {/* Profile Picture Section */}
          <Grid item xs={12} md={4}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={2}
            >
              <Box position="relative">
                <Avatar
                  src={user?.avatar}
                  alt={user?.username}
                  sx={{ width: 150, height: 150 }}
                />
                {isUploadingAvatar && (
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bgcolor="rgba(0,0,0,0.5)"
                    borderRadius="50%"
                  >
                    <CircularProgress size={40} />
                  </Box>
                )}
              </Box>

              <IconButton
                color="primary"
                component="label"
                disabled={isUploadingAvatar}
              >
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleAvatarUpload}
                />
                <PhotoCameraIcon />
              </IconButton>

              {avatarError && (
                <Alert
                  severity="error"
                  sx={{ width: "100%", fontSize: "0.75rem" }}
                >
                  {avatarError}
                </Alert>
              )}

              <Typography variant="h5" fontWeight="bold">
                {user?.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </Grid>

          {/* Profile Information Section */}
          <Grid item xs={12} md={8}>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Bio
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                  />
                </Box>

                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Instagram
                  </Typography>
                  <TextField
                    fullWidth
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="@username"
                    InputProps={{
                      startAdornment: (
                        <InstagramIcon
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                      ),
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Cameras
                  </Typography>
                  <Box display="flex" gap={1} mb={2}>
                    <TextField
                      fullWidth
                      value={newCamera}
                      onChange={(e) => setNewCamera(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Add a camera"
                      InputProps={{
                        startAdornment: (
                          <CameraAltIcon
                            sx={{ mr: 1, color: "text.secondary" }}
                          />
                        ),
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddCamera}
                      disabled={!isEditing || !newCamera.trim()}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {formData.cameras.map((camera) => (
                      <Chip
                        key={camera}
                        label={camera}
                        onDelete={
                          isEditing
                            ? () => handleRemoveCamera(camera)
                            : undefined
                        }
                      />
                    ))}
                  </Box>
                </Box>

                <Box display="flex" gap={2} justifyContent="flex-end">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outlined"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="contained">
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  )}
                </Box>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile;
