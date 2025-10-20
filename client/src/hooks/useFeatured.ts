import { useMutation } from "@apollo/client";
import { useAdmin } from "../context/AdminContext";
import {
  MAKE_PRESET_FEATURED,
  REMOVE_PRESET_FEATURED,
} from "../graphql/mutations/makePresetFeatured";
import {
  MAKE_FILMSIM_FEATURED,
  REMOVE_FILMSIM_FEATURED,
} from "../graphql/mutations/makeFilmSimFeatured";

export const useFeatured = () => {
  const { isAdmin } = useAdmin();

  const [makePresetFeatured] = useMutation(MAKE_PRESET_FEATURED);
  const [removePresetFeatured] = useMutation(REMOVE_PRESET_FEATURED);
  const [makeFilmSimFeatured] = useMutation(MAKE_FILMSIM_FEATURED);
  const [removeFilmSimFeatured] = useMutation(REMOVE_FILMSIM_FEATURED);

  const togglePresetFeatured = async (
    presetId: string,
    isFeatured: boolean
  ) => {
    if (!isAdmin) {
      throw new Error("Only administrators can manage featured status");
    }

    try {
      if (isFeatured) {
        await removePresetFeatured({ variables: { presetId } });
      } else {
        await makePresetFeatured({ variables: { presetId } });
      }
    } catch (error) {
      console.error("Error toggling preset featured status:", error);
      throw error;
    }
  };

  const toggleFilmSimFeatured = async (
    filmSimId: string,
    isFeatured: boolean
  ) => {
    if (!isAdmin) {
      throw new Error("Only administrators can manage featured status");
    }

    try {
      if (isFeatured) {
        await removeFilmSimFeatured({ variables: { filmSimId } });
      } else {
        await makeFilmSimFeatured({ variables: { filmSimId } });
      }
    } catch (error) {
      console.error("Error toggling film sim featured status:", error);
      throw error;
    }
  };

  return {
    isAdmin,
    togglePresetFeatured,
    toggleFilmSimFeatured,
  };
};
