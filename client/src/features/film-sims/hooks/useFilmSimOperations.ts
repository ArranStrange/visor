import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { DELETE_FILMSIM } from "@/features/film-sims/graphql/filmSims";
import { useFeatured } from "@/hooks/useFeatured";
import type { FilmSimSummary } from "@/types/graphql";

type FilmSimOperationTarget = Pick<FilmSimSummary, "id" | "name"> &
  Partial<Pick<FilmSimSummary, "featured">>;

export const useFilmSimOperations = (
  filmSim: FilmSimOperationTarget,
  onRefetch: () => void
) => {
  const navigate = useNavigate();
  const { toggleFilmSimFeatured } = useFeatured();

  const [deleteFilmSim, { loading: deletingFilmSim }] =
    useMutation(DELETE_FILMSIM);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteFilmSim = async () => {
    try {
      await deleteFilmSim({
        variables: { id: filmSim.id },
      });
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
