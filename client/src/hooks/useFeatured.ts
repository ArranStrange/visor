import { useMutation } from "@apollo/client";
import { useIsAdmin } from "./useIsAdmin";
import {
  MAKE_PRESET_FEATURED,
  REMOVE_PRESET_FEATURED,
} from "../graphql/presets";
import {
  MAKE_FILMSIM_FEATURED,
  REMOVE_FILMSIM_FEATURED,
} from "../graphql/filmSims";

export const useFeatured = () => {
  const isAdmin = useIsAdmin();

  const [makePresetFeatured] = useMutation(MAKE_PRESET_FEATURED, {
    refetchQueries: ["GetFeaturedItems", "ListPresets", "GetPresetBySlug"],
    awaitRefetchQueries: true,
  });
  const [removePresetFeatured] = useMutation(REMOVE_PRESET_FEATURED, {
    refetchQueries: ["GetFeaturedItems", "ListPresets", "GetPresetBySlug"],
    awaitRefetchQueries: true,
  });
  const [makeFilmSimFeatured] = useMutation(MAKE_FILMSIM_FEATURED, {
    refetchQueries: ["GetFeaturedItems", "ListFilmSims", "GetFilmSimBySlug"],
    awaitRefetchQueries: true,
  });
  const [removeFilmSimFeatured] = useMutation(REMOVE_FILMSIM_FEATURED, {
    refetchQueries: ["GetFeaturedItems", "ListFilmSims", "GetFilmSimBySlug"],
    awaitRefetchQueries: true,
  });

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
