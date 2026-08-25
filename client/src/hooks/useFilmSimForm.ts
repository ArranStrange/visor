import { useState, useEffect, useCallback } from "react";
import { WhiteBalanceShift } from "../components/settings/WhiteBalanceGrid";
import { FilmSimSettings } from "../types/filmSim";
import type { FilmSimDetailResult } from "../graphql/filmSims";

export type FilmSimData = FilmSimDetailResult;

export interface FormData {
  name: string;
  description: string;
  notes: string;
  tags: string;
  compatibleSensors: string[];
  settings: FilmSimSettings;
}

export type FilmSimFormField =
  | Exclude<keyof FormData, "settings">
  | `settings.${keyof FilmSimSettings}`
  | `settings.wbShift.${keyof WhiteBalanceShift}`;

export type FilmSimFormValue =
  string | number | null | string[] | WhiteBalanceShift;

export type FilmSimFormChangeHandler = (
  field: FilmSimFormField,
  value: FilmSimFormValue
) => void;

const getDefaultSettings = (): FilmSimSettings => ({
  filmSimulation: "PROVIA",
  dynamicRange: null,
  highlight: 0,
  shadow: 0,
  color: 0,
  sharpness: 0,
  noiseReduction: 0,
  grainEffect: "OFF",
  clarity: 0,
  whiteBalance: "AUTO",
  wbShift: { r: 0, b: 0 },
  colorChromeEffect: "OFF",
  colorChromeFxBlue: "OFF",
});

const createFormDataFromFilmSim = (filmSim: FilmSimData): FormData => ({
  name: filmSim.name || "",
  description: filmSim.description || "",
  notes: filmSim.notes || "",
  tags:
    filmSim.tags
      ?.filter((tag) => tag.displayName)
      .map((tag) => tag.displayName)
      .join(", ") || "",
  compatibleSensors: filmSim.compatibleSensors || [],
  settings: {
    ...getDefaultSettings(),
    ...filmSim.settings,
  },
});

export const useFilmSimForm = (filmSim: FilmSimData) => {
  const [formData, setFormData] = useState<FormData>(() =>
    createFormDataFromFilmSim(filmSim)
  );

  // Update form data when filmSim changes
  useEffect(() => {
    setFormData(createFormDataFromFilmSim(filmSim));
  }, [filmSim]);

  const handleInputChange = useCallback<FilmSimFormChangeHandler>(
    (field, value) => {
      if (field.startsWith("settings.wbShift.")) {
        const wbKey = field.replace("settings.wbShift.", "");
        setFormData((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            wbShift: {
              r: prev.settings.wbShift?.r || 0,
              b: prev.settings.wbShift?.b || 0,
              [wbKey]: parseInt(String(value)) || 0,
            },
          },
        }));
      } else if (field.startsWith("settings.")) {
        const settingKey = field.replace("settings.", "");
        setFormData((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            [settingKey]: value,
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [field]: value,
        }));
      }
    },
    []
  );

  const createUpdateInput = useCallback(
    () => ({
      name: formData.name,
      description: formData.description,
      notes: formData.notes,
      compatibleSensors: formData.compatibleSensors,
      settings: {
        dynamicRange: formData.settings.dynamicRange,
        filmSimulation: formData.settings.filmSimulation,
        whiteBalance: formData.settings.whiteBalance,
        wbShift: {
          r: formData.settings.wbShift?.r || 0,
          b: formData.settings.wbShift?.b || 0,
        },
        color: formData.settings.color || 0,
        sharpness: formData.settings.sharpness || 0,
        highlight: formData.settings.highlight || 0,
        shadow: formData.settings.shadow || 0,
        noiseReduction: formData.settings.noiseReduction || 0,
        grainEffect: formData.settings.grainEffect,
        clarity: formData.settings.clarity || 0,
        colorChromeEffect: formData.settings.colorChromeEffect,
        colorChromeFxBlue: formData.settings.colorChromeFxBlue,
      },
    }),
    [formData]
  );

  return {
    formData,
    handleInputChange,
    createUpdateInput,
  };
};
