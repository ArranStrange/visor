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
      favouriteLists {
        id
        name
      }
      customLists {
        id
        name
      }
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

  const {
    loading,
    error: queryError,
    data,
  } = useQuery(GET_USER_PROFILE, {
    onCompleted: (data) => {
      if (data?.getCurrentUser) {
        setFormData({
          bio: data.getCurrentUser.bio || "",
          instagram: data.getCurrentUser.instagram || "",
          cameras: data.getCurrentUser.cameras || [],
        });
      }
    },
  });

  const [updateProfile, { loading: updating }] = useMutation(
    UPDATE_USER_PROFILE,
    {
      onCompleted: () => {
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
        setTimeout(() => setSuccess(null), 3000);
      },
      onError: (error) => {
        setError(error.message);
        setTimeout(() => setError(null), 3000);
      },
    }
  );

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
      await updateProfile({
        variables: {
          input: {
            bio: formData.bio,
            instagram: formData.instagram,
            cameras: formData.cameras,
          },
        },
      });
    } catch (err) {
      console.error("Error updating profile:", err);
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
              <Avatar
                src={user?.avatar}
                alt={user?.username}
                sx={{ width: 150, height: 150 }}
              />
              <IconButton
                color="primary"
                component="label"
                disabled={!isEditing}
              >
                <input hidden accept="image/*" type="file" />
                <PhotoCameraIcon />
              </IconButton>
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
                        disabled={updating}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={updating}
                      >
                        {updating ? (
                          <CircularProgress size={24} />
                        ) : (
                          "Save Changes"
                        )}
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
