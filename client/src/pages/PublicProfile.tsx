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
  Alert as MuiAlert,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Snackbar,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import { GET_USER_UPLOADS } from "../graphql/queries/getUserUploads";
import { useAuth } from "../context/AuthContext";
import EditIcon from "@mui/icons-material/Edit";
import InstagramIcon from "@mui/icons-material/Instagram";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ListIcon from "@mui/icons-material/List";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ShareIcon from "@mui/icons-material/Share";
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
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

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
        <MuiAlert severity="error">
          Error loading profile: {error.message}
        </MuiAlert>
      </Container>
    );
  }

  const user = userData?.getUser;
  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <MuiAlert severity="error">User not found</MuiAlert>
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

  const handleShare = async () => {
    const shareData = {
      title: `${user.username}'s Profile on VISOR`,
      text: `Check out ${user.username}'s presets and film sims on VISOR!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error sharing profile:", err);
        }
      }
    } else {
      // Fallback for desktop or unsupported browsers
      try {
        await navigator.clipboard.writeText(window.location.href);
        setSnackbarMessage("Profile URL copied to clipboard!");
        setSnackbarOpen(true);
      } catch (err) {
        setSnackbarMessage("Failed to copy URL.");
        setSnackbarOpen(true);
      }
    }
  };

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 1, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* New Instagram-style Header */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "auto 1fr" },
            gap: { xs: 2, md: 5 },
            mb: 4,
            alignItems: "center",
          }}
        >
          {/* Left Column: Avatar */}
          <Box
            display="flex"
            justifyContent="center"
            alignItems="flex-start"
            sx={{
              width: { xs: 120, md: 150 },
              height: { xs: 120, md: 150 },
              mx: "auto",
            }}
          >
            <Avatar
              src={user.avatar}
              alt={user.username}
              sx={{ width: "100%", height: "100%" }}
            />
          </Box>

          {/* Right Column: User Info, Stats, Bio */}
          <Stack spacing={2}>
            {/* Row 1: Username & Buttons */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                gap: { xs: 1, sm: 2 },
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                sx={{ textAlign: { xs: "center", sm: "left" } }}
              >
                {user.username &&
                  user.username.charAt(0).toUpperCase() +
                    user.username.slice(1)}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                {isOwnProfile && (
                  <IconButton
                    size="small"
                    onClick={() => navigate("/profile")}
                    aria-label="edit profile"
                  >
                    <EditIcon />
                  </IconButton>
                )}
                <IconButton onClick={handleShare} aria-label="share profile">
                  <ShareIcon />
                </IconButton>
              </Stack>
            </Box>

            {/* Row 2: Stats */}
            <Stack
              direction="row"
              spacing={{ xs: 2, md: 4 }}
              sx={{ justifyContent: { xs: "center", sm: "flex-start" } }}
            >
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold">
                  {presets.length}
                </Typography>
                <Typography color="text.secondary">Presets</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold">
                  {filmSims.length}
                </Typography>
                <Typography color="text.secondary">Film Sims</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold">
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
                <Typography color="text.secondary">Likes</Typography>
              </Box>
            </Stack>

            {/* Row 3: Bio, Social, Cameras */}
            <Stack spacing={2} sx={{ pt: 1 }}>
              {user.bio && (
                <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                  <Typography
                    variant="body1"
                    sx={(theme) => ({
                      fontStyle: "italic",
                      textAlign: { xs: "center", sm: "left" },
                      // Apply truncation only on mobile and when not expanded
                      ...(!isBioExpanded && {
                        [theme.breakpoints.down("sm")]: {
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        },
                      }),
                    })}
                  >
                    {user.bio}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setIsBioExpanded(!isBioExpanded)}
                    sx={{
                      display: { xs: "inline-block", sm: "none" },
                      p: 0,
                      mt: 0.5,
                      textTransform: "none",
                      color: "text.secondary",
                      fontWeight: "bold",
                    }}
                  >
                    {isBioExpanded ? "Show less" : "more"}
                  </Button>
                </Box>
              )}
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
              {user.cameras && user.cameras.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Cameras
                  </Typography>
                  <Box
                    display="flex"
                    flexWrap="wrap"
                    gap={1}
                    sx={{ justifyContent: { xs: "center", sm: "flex-start" } }}
                  >
                    {user.cameras.map((camera: string) => (
                      <Chip
                        key={camera}
                        label={camera}
                        icon={<CameraAltIcon />}
                        variant="outlined"
                        sx={{
                          borderColor: "orange.main",
                          color: "orange.main",
                          "& .MuiChip-icon": {
                            color: "orange.main",
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Stack>
          </Stack>
        </Box>

        {/* Lists Section */}
        {publicLists.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Lists
            </Typography>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="lists-content"
                id="lists-header"
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <ListIcon color="primary" />
                  <Typography variant="h6">
                    Public Lists ({publicLists.length})
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List sx={{ p: 0 }}>
                  {publicLists.map((list: any, index: number) => (
                    <React.Fragment key={list.id}>
                      <ListItem disablePadding>
                        <ListItemButton
                          onClick={() => navigate(`/list/${list.id}`)}
                        >
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="h6" component="span">
                                  {list.name}
                                </Typography>
                                <Chip
                                  size="small"
                                  label="Public"
                                  color="primary"
                                />
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
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
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
              </AccordionDetails>
            </Accordion>
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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default PublicProfile;
