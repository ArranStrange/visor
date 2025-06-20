import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Avatar,
  Button,
  Paper,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import { GET_USER_UPLOADS } from "../graphql/queries/getUserUploads";
import { useAuth } from "../context/AuthContext";
import EditIcon from "@mui/icons-material/Edit";
import InstagramIcon from "@mui/icons-material/Instagram";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ListIcon from "@mui/icons-material/List";
import ContentTypeToggle from "../components/ContentTypeToggle";
import ContentGridLoader from "../components/ContentGridLoader";
import { useContentType } from "../context/ContentTypeFilter";
import PresetCard from "../components/PresetCard";
import FilmSimCard from "../components/FilmSimCard";

const GET_USER_LISTS = gql`
  query GetUserLists($userId: ID!) {
    getUserLists(userId: $userId) {
      id
      name
      description
      isPublic
      createdAt
      presets {
        id
        title
        slug
        afterImage {
          url
        }
      }
      filmSims {
        id
        name
        slug
        sampleImages {
          url
        }
      }
    }
  }
`;

const PublicProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { contentType } = useContentType();

  const {
    loading: userLoading,
    error: userError,
    data: userData,
  } = useQuery(GET_USER_UPLOADS, {
    variables: { userId },
    skip: !userId,
  });

  const {
    loading: listsLoading,
    error: listsError,
    data: listsData,
  } = useQuery(GET_USER_LISTS, {
    variables: { userId },
    skip: !userId,
  });

  const isOwnProfile = currentUser?.id === userId;
  const loading = userLoading || listsLoading;
  const error = userError || listsError;

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

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Error loading profile: {error.message}</Alert>
      </Container>
    );
  }

  const user = userData?.getUser;
  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">User not found</Alert>
      </Container>
    );
  }

  const presets = user.presets || [];
  const filmSims = user.filmSims || [];
  const lists = listsData?.getUserLists || [];

  // Filter to only show public lists
  const publicLists = lists.filter((list: any) => list.isPublic);

  // Combine presets and film sims for ContentGridLoader
  const allContent = [
    ...presets.map((preset: any) => ({
      type: "preset" as const,
      data: preset,
    })),
    ...filmSims.map((filmSim: any) => ({
      type: "film" as const,
      data: {
        ...filmSim,
        title: filmSim.name,
        thumbnail: filmSim.sampleImages?.[0]?.url || "",
        tags: filmSim.tags || [],
      },
    })),
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* Profile Header */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
            gap: 4,
            mb: 4,
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
          >
            <Avatar
              src={user.avatar}
              alt={user.username}
              sx={{ width: 150, height: 150 }}
            />
            <Typography variant="h4" fontWeight="bold">
              {user.username}
            </Typography>
            {user.bio && (
              <Typography
                variant="body1"
                color="text.secondary"
                textAlign="center"
                sx={{ maxWidth: 300 }}
              >
                {user.bio}
              </Typography>
            )}
            {isOwnProfile && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate("/profile")}
              >
                Edit Profile
              </Button>
            )}
          </Box>

          <Stack spacing={3}>
            {/* Social Links */}
            {user.instagram && (
              <Box display="flex" alignItems="center" gap={1}>
                <InstagramIcon color="action" />
                <Typography variant="body1">
                  <a
                    href={`https://instagram.com/${user.instagram.replace(
                      "@",
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {user.instagram}
                  </a>
                </Typography>
              </Box>
            )}

            {/* Cameras */}
            {user.cameras && user.cameras.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Cameras
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {user.cameras.map((camera: string) => (
                    <Chip
                      key={camera}
                      label={camera}
                      icon={<CameraAltIcon />}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Stats */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Stats
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 2,
                }}
              >
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {presets.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Presets
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {filmSims.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Film Sims
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {presets.reduce(
                      (total: number, preset: any) =>
                        total + (preset.likes?.length || 0),
                      0
                    ) +
                      filmSims.reduce(
                        (total: number, filmSim: any) =>
                          total + (filmSim.likes?.length || 0),
                        0
                      )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Likes
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* Lists Section */}
        {publicLists.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Lists
            </Typography>
            <List
              sx={{
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              {publicLists.map((list: any, index: number) => (
                <React.Fragment key={list.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => navigate(`/list/${list.id}`)}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <ListIcon color="primary" />
                            <Typography variant="h6" component="span">
                              {list.name}
                            </Typography>
                            <Chip size="small" label="Public" color="primary" />
                          </Box>
                        }
                        secondary={
                          <Box>
                            {list.description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                mb={1}
                              >
                                {list.description}
                              </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
                              {list.presets?.length || 0} presets •{" "}
                              {list.filmSims?.length || 0} film sims
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < publicLists.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}

        {/* Content Type Toggle */}
        <Box sx={{ mb: 3 }}>
          <ContentTypeToggle />
        </Box>

        {/* Contributions Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Contributions
          </Typography>
        </Box>

        {/* Content Grid */}
        <ContentGridLoader contentType={contentType} customData={allContent} />

        {/* Empty State */}
        {allContent.length === 0 && (
          <Box display="flex" flexDirection="column" alignItems="center" py={8}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No content yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isOwnProfile
                ? "Start creating presets and film sims to see them here!"
                : "This user hasn't uploaded any content yet."}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PublicProfile;
