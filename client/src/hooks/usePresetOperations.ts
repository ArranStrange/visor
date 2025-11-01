import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { DELETE_PRESET } from "../graphql/mutations/deletePreset";
import { UPDATE_PRESET } from "../graphql/mutations/updatePreset";
import { GET_PRESET_BY_SLUG } from "../graphql/queries/getPresetBySlug";
import { useFeatured } from "./useFeatured";
import { ParsedSettings } from "../types/xmpSettings";
import { stripTypename } from "../utils/presetDetailUtils";

interface EditFormData {
  title: string;
  description: string;
  notes: string;
  tags: string;
}

interface Preset {
  id: string;
  slug: string;
  title: string;
  description?: string;
  notes?: string;
  featured?: boolean;
  tags: Array<{ displayName: string }>;
  settings?: any;
  toneCurve?: any;
}

export const usePresetOperations = (preset: Preset) => {
  const navigate = useNavigate();
  const { togglePresetFeatured } = useFeatured();

  const [deletePreset, { loading: deletingPreset }] =
    useMutation(DELETE_PRESET);
  const [updatePreset, { loading: updatingPreset }] =
    useMutation(UPDATE_PRESET);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [parsedSettings, setParsedSettings] = useState<ParsedSettings | null>(
    null
  );
  const [editFormData, setEditFormData] = useState<EditFormData>({
    title: "",
    description: "",
    notes: "",
    tags: "",
  });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleEdit = () => {
    setEditFormData({
      title: preset.title,
      description: preset.description || "",
      notes: preset.notes || "",
      tags: preset.tags.map((tag) => tag?.displayName || "Unknown").join(", "),
    });
    setParsedSettings(null);
    setSaveError(null);
    setSaveSuccess(false);
    setEditDialogOpen(true);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeletePreset = async () => {
    try {
      await deletePreset({
        variables: { id: preset.id },
      });
      navigate("/");
    } catch (err) {
      console.error("Error deleting preset:", err);
    }
  };

  const handleToggleFeatured = async () => {
    try {
      await togglePresetFeatured(preset.id, preset.featured || false);
      window.location.reload();
    } catch (error) {
      console.error("Error toggling featured status:", error);
    }
  };

  const handleSettingsParsed = (settings: ParsedSettings) => {
    if (!settings || typeof settings !== "object") {
      console.error("Invalid settings format received from XMP parser");
      return;
    }
    setParsedSettings(settings);
  };

  const handleSavePreset = async () => {
    try {
      const updateInput: any = {
        title: editFormData.title,
        description: editFormData.description,
        notes: editFormData.notes,
      };

      if (parsedSettings) {
        updateInput.settings = {
          exposure: parsedSettings.exposure || 0,
          contrast: parsedSettings.contrast || 0,
          highlights: parsedSettings.highlights || 0,
          shadows: parsedSettings.shadows || 0,
          whites: parsedSettings.whites || 0,
          blacks: parsedSettings.blacks || 0,
          temp: parsedSettings.temp || 0,
          tint: parsedSettings.tint || 0,
          vibrance: parsedSettings.vibrance || 0,
          saturation: parsedSettings.saturation || 0,
          clarity: parsedSettings.clarity || 0,
          dehaze: parsedSettings.dehaze || 0,
          grain: parsedSettings.effects?.grainAmount
            ? {
                amount: parsedSettings.effects.grainAmount || 0,
                size: parsedSettings.effects.grainSize || 0,
                roughness: parsedSettings.effects.grainFrequency || 0,
              }
            : undefined,
          sharpening: parsedSettings.detail?.sharpness || 0,
          noiseReduction: parsedSettings.detail?.colorNoiseReduction
            ? {
                luminance: parsedSettings.detail.luminanceSmoothing || 0,
                detail: parsedSettings.detail.luminanceDetail || 0,
                color: parsedSettings.detail.colorNoiseReduction || 0,
              }
            : undefined,
        };

        if (parsedSettings.toneCurve) {
          updateInput.toneCurve = {
            rgb: parsedSettings.toneCurve.rgb || [],
            red: parsedSettings.toneCurve.red || [],
            green: parsedSettings.toneCurve.green || [],
            blue: parsedSettings.toneCurve.blue || [],
          };
        }
      } else {
        updateInput.settings = stripTypename(preset.settings);
        if (preset.toneCurve) {
          updateInput.toneCurve = stripTypename(preset.toneCurve);
        }
      }

      await updatePreset({
        variables: {
          id: preset.id,
          input: updateInput,
        },
        refetchQueries: [
          {
            query: GET_PRESET_BY_SLUG,
            variables: { slug: preset.slug },
          },
        ],
      });

      setEditDialogOpen(false);
      setParsedSettings(null);
      setSaveSuccess(true);
      setSaveError(null);
    } catch (err) {
      console.error("Error updating preset:", err);
      setSaveError(
        "An error occurred while updating the preset. Please try again later."
      );
    }
  };

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    parsedSettings,
    editFormData,
    setEditFormData,
    saveError,
    saveSuccess,
    deletingPreset,
    updatingPreset,
    handleEdit,
    handleDelete,
    handleDeletePreset,
    handleToggleFeatured,
    handleSettingsParsed,
    handleSavePreset,
  };
};
