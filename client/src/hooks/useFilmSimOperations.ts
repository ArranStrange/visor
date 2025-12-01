import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { DELETE_FILMSIM } from "../graphql/mutations/deleteFilmSim";
import { useFeatured } from "./useFeatured";

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
      // Error deleting film simulation
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
