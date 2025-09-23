import React from "react";
import {
  Paper,
  Typography,
  Stack,
  Grid,
  FormControl,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
} from "@mui/material";
import WhiteBalanceGrid from "./WhiteBalanceGrid";
import {
  DYNAMIC_RANGE_OPTIONS,
  FILM_SIMULATION_OPTIONS,
  WHITE_BALANCE_OPTIONS,
  TONE_SLIDER_OPTIONS,
  COLOR_OPTIONS,
  NOISE_REDUCTION_OPTIONS,
  GRAIN_EFFECT_OPTIONS,
  CLARITY_OPTIONS,
  COLOR_CHROME_EFFECT_OPTIONS,
  COLOR_CHROME_FX_BLUE_OPTIONS,
} from "../data/filmSimSettings";
import { FilmSimSettings } from "../hooks/useFilmSimForm";

interface FilmSimSettingsFormProps {
  settings: FilmSimSettings;
  onSettingChange: (field: string, value: any) => void;
}

const SettingField: React.FC<{
  label: string;
  value: string | number | null | undefined;
  options: { value: string | number | null; label: string }[];
  settingKey: keyof FilmSimSettings;
  onSettingChange: (field: string, value: any) => void;
}> = ({ label, value, options, settingKey, onSettingChange }) => (
  <Grid {...(undefined as any)} item xs={12} md={6}>
    <FormControl fullWidth>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Typography>{label}</Typography>
      </Box>
      <Select
        value={value === null ? "null" : value}
        onChange={(e: SelectChangeEvent<string | number>) => {
          const newValue = options.find(
            (opt) =>
              (opt.value === null ? "null" : opt.value) === e.target.value
          )?.value;
          if (newValue !== undefined) {
            onSettingChange(`settings.${settingKey}`, newValue);
          }
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value === null ? "null" : option.value.toString()}
            value={option.value === null ? "null" : option.value.toString()}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Grid>
);

const FilmSimSettingsForm: React.FC<FilmSimSettingsFormProps> = ({
  settings,
  onSettingChange,
}) => {
  const settingConfigs = [
    {
      label: "Dynamic Range",
      value: settings.dynamicRange,
      options: DYNAMIC_RANGE_OPTIONS,
      key: "dynamicRange" as keyof FilmSimSettings,
    },
    {
      label: "Film Simulation",
      value: settings.filmSimulation,
      options: FILM_SIMULATION_OPTIONS,
      key: "filmSimulation" as keyof FilmSimSettings,
    },
    {
      label: "White Balance",
      value: settings.whiteBalance,
      options: WHITE_BALANCE_OPTIONS,
      key: "whiteBalance" as keyof FilmSimSettings,
    },
    {
      label: "Color",
      value: settings.color,
      options: COLOR_OPTIONS,
      key: "color" as keyof FilmSimSettings,
    },
    {
      label: "Sharpness",
      value: settings.sharpness,
      options: TONE_SLIDER_OPTIONS,
      key: "sharpness" as keyof FilmSimSettings,
    },
    {
      label: "Highlight Tone",
      value: settings.highlight,
      options: TONE_SLIDER_OPTIONS,
      key: "highlight" as keyof FilmSimSettings,
    },
    {
      label: "Shadow Tone",
      value: settings.shadow,
      options: TONE_SLIDER_OPTIONS,
      key: "shadow" as keyof FilmSimSettings,
    },
    {
      label: "Noise Reduction",
      value: settings.noiseReduction,
      options: NOISE_REDUCTION_OPTIONS,
      key: "noiseReduction" as keyof FilmSimSettings,
    },
    {
      label: "Grain Effect",
      value: settings.grainEffect,
      options: GRAIN_EFFECT_OPTIONS,
      key: "grainEffect" as keyof FilmSimSettings,
    },
    {
      label: "Clarity",
      value: settings.clarity,
      options: CLARITY_OPTIONS,
      key: "clarity" as keyof FilmSimSettings,
    },
    {
      label: "Color Chrome Effect",
      value: settings.colorChromeEffect,
      options: COLOR_CHROME_EFFECT_OPTIONS,
      key: "colorChromeEffect" as keyof FilmSimSettings,
    },
    {
      label: "Color Chrome FX Blue",
      value: settings.colorChromeFxBlue,
      options: COLOR_CHROME_FX_BLUE_OPTIONS,
      key: "colorChromeFxBlue" as keyof FilmSimSettings,
    },
  ];

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Film Simulation Settings
      </Typography>
      <Stack spacing={3}>
        <Grid container spacing={2}>
          {settingConfigs.map((config) => (
            <SettingField
              key={config.key}
              label={config.label}
              value={config.value}
              options={config.options}
              settingKey={config.key}
              onSettingChange={onSettingChange}
            />
          ))}

          <Box sx={{ mt: 3, mb: 2, width: "100%" }}>
            <Typography variant="subtitle2" gutterBottom>
              White Balance Shift
            </Typography>
            <WhiteBalanceGrid
              value={settings.wbShift || { r: 0, b: 0 }}
              onChange={(value) => onSettingChange("settings.wbShift", value)}
            />
          </Box>
        </Grid>
      </Stack>
    </Paper>
  );
};

export default FilmSimSettingsForm;
