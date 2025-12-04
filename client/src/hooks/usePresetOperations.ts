import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { DELETE_PRESET } from "../graphql/mutations/deletePreset";
import { UPDATE_PRESET } from "../graphql/mutations/updatePreset";
import { GET_PRESET_BY_SLUG } from "../graphql/queries/getPresetBySlug";
import { useFeatured } from "./useFeatured";
import { ParsedSettings } from "../types/xmpSettings";
import { stripTypename } from "lib/utils/presetDetailUtils";
import {
  PresetEditRequested,
  PresetDeleteRequested,
  PresetDeleteConfirmed,
  PresetSaveRequested,
  PresetSaved,
  PresetDeleted,
  FeaturedToggle,
} from "lib/events/event-definitions";
import { useEffect } from "react";

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

  // Listen to PresetSaveRequested event
  PresetSaveRequested.useEvent(
    async (data) => {
      if (data?.presetId === preset.id) {
        await handleSavePresetFromEvent(data.formData, data.parsedSettings);
      }
    },
    [preset.id]
  );

  // Listen to FeaturedToggle event
  FeaturedToggle.useEvent(
    async (data) => {
      if (data?.itemType === "preset" && data?.itemId === preset.id) {
        await handleToggleFeatured();
      }
    },
    [preset.id]
  );

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
    // Raise event for components listening
    PresetEditRequested.raise({ presetId: preset.id, preset });
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    // Raise event for components listening
    PresetDeleteRequested.raise({ presetId: preset.id, preset });
  };

  // Listen to PresetDeleteConfirmed event
  PresetDeleteConfirmed.useEvent(
    async (data) => {
      if (data?.presetId === preset.id) {
        await handleDeletePreset();
      }
    },
    [preset.id]
  );

  const handleDeletePreset = async () => {
    try {
      await deletePreset({
        variables: { id: preset.id },
      });
      // Raise event after successful delete
      PresetDeleted.raise({ presetId: preset.id, preset });
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

  const handleSavePresetFromEvent = async (
    formData?: EditFormData,
    parsedSettingsData?: ParsedSettings | null
  ) => {
    const dataToUse = formData || editFormData;
    const settingsToUse =
      parsedSettingsData !== undefined ? parsedSettingsData : parsedSettings;

    try {
      const updateInput: any = {
        title: dataToUse.title,
        description: dataToUse.description,
        notes: dataToUse.notes,
      };

      if (settingsToUse) {
        updateInput.settings = {
          exposure: settingsToUse.exposure || 0,
          contrast: settingsToUse.contrast || 0,
          highlights: settingsToUse.highlights || 0,
          shadows: settingsToUse.shadows || 0,
          whites: settingsToUse.whites || 0,
          blacks: settingsToUse.blacks || 0,
          temp: settingsToUse.temp || 0,
          tint: settingsToUse.tint || 0,
          vibrance: settingsToUse.vibrance || 0,
          saturation: settingsToUse.saturation || 0,
          clarity: settingsToUse.clarity || 0,
          dehaze: settingsToUse.dehaze || 0,
          grain: settingsToUse.effects?.grainAmount
            ? {
                amount: settingsToUse.effects.grainAmount || 0,
                size: settingsToUse.effects.grainSize || 0,
                roughness: settingsToUse.effects.grainFrequency || 0,
              }
            : undefined,
          sharpening: settingsToUse.detail?.sharpness || 0,
          noiseReduction: settingsToUse.detail?.colorNoiseReduction
            ? {
                luminance: settingsToUse.detail.luminanceSmoothing || 0,
                detail: settingsToUse.detail.luminanceDetail || 0,
                color: settingsToUse.detail.colorNoiseReduction || 0,
              }
            : undefined,
        };

        if (settingsToUse.toneCurve) {
          updateInput.toneCurve = {
            rgb: settingsToUse.toneCurve.rgb || [],
            red: settingsToUse.toneCurve.red || [],
            green: settingsToUse.toneCurve.green || [],
            blue: settingsToUse.toneCurve.blue || [],
          };
        }
      } else {
        updateInput.settings = stripTypename(preset.settings);
        if (preset.toneCurve) {
          updateInput.toneCurve = stripTypename(preset.toneCurve);
        }
      }

      const result = await updatePreset({
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

      // Raise event after successful save
      PresetSaved.raise({
        presetId: preset.id,
        preset: result.data?.updatePreset || preset,
      });
    } catch (err) {
      console.error("Error updating preset:", err);
      setSaveError(
        "An error occurred while updating the preset. Please try again later."
      );
    }
  };

  const handleSavePreset = async () => {
    await handleSavePresetFromEvent();
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
