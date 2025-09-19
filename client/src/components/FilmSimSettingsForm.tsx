import React from "react";
import { Paper, Typography, Stack, Grid, Box } from "@mui/material";
import WhiteBalanceGrid from "./WhiteBalanceGrid";
import FilmSimSettingSelect from "./FilmSimSettingSelect";
import { FilmSimSettings } from "../types/filmSim";
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

interface FilmSimSettingsFormProps {
  settings: FilmSimSettings;
  onSettingChange: (settingKey: keyof FilmSimSettings, value: any) => void;
}

const FilmSimSettingsForm: React.FC<FilmSimSettingsFormProps> = ({
  settings,
  onSettingChange,
}) => (
  <Paper sx={{ p: 3, mt: 2 }}>
    <Typography variant="h6" gutterBottom>
      Film Simulation Settings
    </Typography>
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <FilmSimSettingSelect
          label="Dynamic Range"
          value={settings.dynamicRange}
          options={DYNAMIC_RANGE_OPTIONS}
          settingKey="dynamicRange"
          onChange={onSettingChange}
        />

        <FilmSimSettingSelect
          label="Film Simulation"
          value={settings.filmSimulation}
          options={FILM_SIMULATION_OPTIONS}
          settingKey="filmSimulation"
          onChange={onSettingChange}
        />

        <FilmSimSettingSelect
          label="White Balance"
          value={settings.whiteBalance}
          options={WHITE_BALANCE_OPTIONS}
          settingKey="whiteBalance"
          onChange={onSettingChange}
        />

        <FilmSimSettingSelect
          label="Color"
          value={settings.color}
          options={COLOR_OPTIONS}
          settingKey="color"
          onChange={onSettingChange}
        />

        <FilmSimSettingSelect
          label="Sharpness"
          value={settings.sharpness}
          options={TONE_SLIDER_OPTIONS}
          settingKey="sharpness"
          onChange={onSettingChange}
        />

        <FilmSimSettingSelect
          label="Highlight Tone"
          value={settings.highlight}
          options={TONE_SLIDER_OPTIONS}
          settingKey="highlight"
          onChange={onSettingChange}
        />

        <FilmSimSettingSelect
          label="Shadow Tone"
          value={settings.shadow}
          options={TONE_SLIDER_OPTIONS}
          settingKey="shadow"
          onChange={onSettingChange}
        />

        <FilmSimSettingSelect
          label="Noise Reduction"
          value={settings.noiseReduction}
          options={NOISE_REDUCTION_OPTIONS}
          settingKey="noiseReduction"
          onChange={onSettingChange}
        />

        <FilmSimSettingSelect
          label="Grain Effect"
          value={settings.grainEffect}
          options={GRAIN_EFFECT_OPTIONS}
          settingKey="grainEffect"
          onChange={onSettingChange}
        />

        <FilmSimSettingSelect
          label="Clarity"
          value={settings.clarity}
          options={CLARITY_OPTIONS}
          settingKey="clarity"
          onChange={onSettingChange}
        />

        <FilmSimSettingSelect
          label="Color Chrome Effect"
          value={settings.colorChromeEffect}
          options={COLOR_CHROME_EFFECT_OPTIONS}
          settingKey="colorChromeEffect"
          onChange={onSettingChange}
        />

        <FilmSimSettingSelect
          label="Color Chrome FX Blue"
          value={settings.colorChromeFxBlue}
          options={COLOR_CHROME_FX_BLUE_OPTIONS}
          settingKey="colorChromeFxBlue"
          onChange={onSettingChange}
        />
      </Grid>

      {settings.whiteBalance !== "AUTO" && (
        <Box sx={{ mt: 2, mb: 3 }}>
          <WhiteBalanceGrid
            value={settings.wbShift}
            onChange={(value) => onSettingChange("wbShift", value)}
          />
        </Box>
      )}
    </Stack>
  </Paper>
);

export default FilmSimSettingsForm;
