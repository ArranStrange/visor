import React, { useEffect } from "react";
import { Container, Box, CircularProgress, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_FILMSIM_BY_SLUG } from "@gql/queries/getFilmSimBySlug";
import { useAuth } from "context/AuthContext";
import { useFeatured } from "hooks/useFeatured";
import { useFilmSimDetailDialogs } from "hooks/useFilmSimDetailDialogs";
import {
  FilmSimDetailToolbar,
  FilmSimDetailSection,
  PageBreadcrumbs,
} from "lib/slots/slot-definitions";
import {
  FilmSimEditRequested,
  FilmSimDeleteRequested,
  FilmSimSaved,
  FilmSimDeleted,
  MenuOpen,
  MenuClose,
  ImageClick,
  NavigateTo,
} from "lib/events/event-definitions";
import FilmSimBreadcrumb from "./filmsim-detail.runtime";

const FilmSimDetails: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { isAdmin } = useFeatured();
  const { loading, error, data, refetch } = useQuery(GET_FILMSIM_BY_SLUG, {
    variables: { slug },
  });

  const filmSim = data?.getFilmSim;

  // Manage all dialogs and operations through a single hook
  const dialogs = useFilmSimDetailDialogs(filmSim, refetch);

  // Listen to FilmSim saved/deleted events
  FilmSimSaved.useEvent(
    (data) => {
      if (data?.filmSimId === filmSim?.id || data?.filmSim?.id === filmSim?.id) {
        refetch();
      }
    },
    [filmSim?.id, refetch]
  );

  FilmSimDeleted.useEvent(() => {
    navigate("/");
  }, [navigate]);

  // Listen to navigation events
  NavigateTo.useEvent(
    (data) => {
      if (data?.path) {
        navigate(data.path);
      }
    },
    [navigate]
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Error loading film simulation: {error.message}
        </Alert>
      </Container>
    );
  }

  if (!filmSim) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Film simulation not found</Alert>
      </Container>
    );
  }

  const isOwner =
    currentUser && filmSim.creator && currentUser.id === filmSim.creator.id;

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: "relative" }}>
      {/* Breadcrumbs - plugins can inject breadcrumb navigation here */}
      <FilmSimBreadcrumb />
      <PageBreadcrumbs.Slot />

      {/* Toolbar - plugins can inject actions here */}
      <FilmSimDetailToolbar.Slot
        filmSim={filmSim}
        isOwner={!!isOwner}
        isAdmin={isAdmin}
        menuAnchorEl={dialogs.toolbarProps.menuAnchorEl}
        menuOpen={dialogs.toolbarProps.menuOpen}
      />

      {/* Sections - plugins can inject content sections here */}
      <FilmSimDetailSection.Slot
        filmSim={filmSim}
        isOwner={!!isOwner}
        currentUser={currentUser}
      />

      {/* Dialogs - managed by plugins or hook */}
      {dialogs.dialogs}
    </Container>
  );
};

export default FilmSimDetails;
