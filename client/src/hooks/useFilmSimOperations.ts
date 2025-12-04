import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { DELETE_FILMSIM } from "../graphql/mutations/deleteFilmSim";
import { useFeatured } from "./useFeatured";
import {
  FilmSimEditRequested,
  FilmSimDeleteRequested,
  FilmSimDeleteConfirmed,
  FilmSimDeleted,
  FilmSimSaved,
  FeaturedToggle,
} from "lib/events/event-definitions";

interface FilmSim {
  id: string;
  name: string;
  featured?: boolean;
}

export const useFilmSimOperations = (
  filmSim: FilmSim,
  onRefetch: () => void
) => {
  const navigate = useNavigate();
  const { toggleFilmSimFeatured } = useFeatured();

  const [deleteFilmSim, { loading: deletingFilmSim }] =
    useMutation(DELETE_FILMSIM);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Listen to FilmSimDeleteConfirmed event
  FilmSimDeleteConfirmed.useEvent(
    async (data) => {
      if (data?.filmSimId === filmSim.id) {
        await handleDeleteFilmSim();
      }
    },
    [filmSim.id]
  );

  // Listen to FeaturedToggle event
  FeaturedToggle.useEvent(
    async (data) => {
      if (data?.itemType === "filmsim" && data?.itemId === filmSim.id) {
        await handleToggleFeatured();
      }
    },
    [filmSim.id]
  );

  const handleEdit = () => {
    setEditDialogOpen(true);
    // Raise event for components listening
    FilmSimEditRequested.raise({ filmSimId: filmSim.id, filmSim });
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    // Raise event for components listening
    FilmSimDeleteRequested.raise({ filmSimId: filmSim.id, filmSim });
  };

  const handleDeleteFilmSim = async () => {
    try {
      await deleteFilmSim({
        variables: { id: filmSim.id },
      });
      // Raise event after successful delete
      FilmSimDeleted.raise({ filmSimId: filmSim.id, filmSim });
      navigate("/");
    } catch (err) {
      console.error("Error deleting film simulation:", err);
    }
  };

  const handleToggleFeatured = async () => {
    try {
      await toggleFilmSimFeatured(filmSim.id, filmSim.featured || false);
      onRefetch();
    } catch (error) {
      console.error("Error toggling featured status:", error);
    }
  };

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    deletingFilmSim,
    handleEdit,
    handleDelete,
    handleDeleteFilmSim,
    handleToggleFeatured,
  };
};
