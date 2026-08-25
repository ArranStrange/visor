import React, { useState } from "react";
import {
  Container,
  Box,
  CircularProgress,
  Alert as MuiAlert,
  Paper,
  Snackbar,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import {
  GET_USER_UPLOADS,
  type GetUserUploadsQueryData,
  type GetUserUploadsQueryVariables,
} from "../graphql/users";
import {
  GET_USER_LISTS_FOR_PUBLIC_PROFILE as GET_USER_LISTS,
  type GetPublicProfileListsQueryData,
  type GetPublicProfileListsQueryVariables,
} from "../graphql/lists";
import { useAuth } from "../context/AuthContext";
import ProfileHeader from "../components/profile/ProfileHeader";
import PublicProfileInfo from "../components/profile/PublicProfileInfo";
import ProfileListsSection from "../components/profile/ProfileListsSection";
import ProfileUploadsGrid from "../components/profile/ProfileUploadsGrid";

const PublicProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const {
    loading: userLoading,
    error: userError,
    data: userData,
  } = useQuery<GetUserUploadsQueryData, GetUserUploadsQueryVariables>(
    GET_USER_UPLOADS,
    {
      variables: { userId: userId! },
      skip: !userId,
    }
  );

  const {
    loading: listsLoading,
    error: listsError,
    data: listsData,
  } = useQuery<
    GetPublicProfileListsQueryData,
    GetPublicProfileListsQueryVariables
  >(GET_USER_LISTS, {
    variables: { userId: userId! },
    skip: !userId,
  });

  const isOwnProfile = currentUser?.id === userId;
  const loading = userLoading || listsLoading;
  const error = userError || listsError;

  if (loading && !userData) {
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
  const likeCount =
    presets.reduce((total, preset) => total + (preset.likes?.length || 0), 0) +
    filmSims.reduce(
      (total, filmSim) => total + (filmSim.likes?.length || 0),
      0
    );

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
        if (!(err instanceof Error) || err.name !== "AbortError") {
          console.error("Error sharing profile:", err);
        }
      }
    } else {
      // Fallback for desktop or unsupported browsers
      try {
        await navigator.clipboard.writeText(window.location.href);
        setSnackbarMessage("Profile URL copied to clipboard!");
        setSnackbarOpen(true);
      } catch {
        setSnackbarMessage("Failed to copy URL.");
        setSnackbarOpen(true);
      }
    }
  };

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
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
        {/* Instagram-style Header */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "auto 1fr" },
            gap: { xs: 2, md: 5 },
            mb: 4,
            alignItems: "center",
          }}
        >
          <ProfileHeader
            avatarUrl={user.avatar}
            avatarAlt={user.username}
            avatarSize={{ xs: 120, md: 150 }}
          />

          <PublicProfileInfo
            username={user.username}
            bio={user.bio}
            instagram={user.instagram}
            cameras={user.cameras}
            presetCount={presets.length}
            filmSimCount={filmSims.length}
            likeCount={likeCount}
            isOwnProfile={isOwnProfile}
            onEdit={() => navigate("/profile")}
            onShare={handleShare}
          />
        </Box>

        <ProfileListsSection lists={lists} />

        <ProfileUploadsGrid
          presets={presets}
          filmSims={filmSims}
          emptyStateMessage={
            isOwnProfile
              ? "Start creating presets and film sims to see them here!"
              : "This user hasn't uploaded any content yet."
          }
        />
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
