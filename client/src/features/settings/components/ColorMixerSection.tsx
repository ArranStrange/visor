import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { ParsedSettings } from "@/types/xmpSettings";
import {
  COLOR_ORDER,
  COLOR_MIXER_COLORS,
  COLOR_MIXER_HUE_SPECTRUM,
  COLOR_MIXER_SETTINGS,
} from "@/features/settings/utils/xmpSettingsConfig";
import { selectedBorderSx } from "@/features/settings/utils/selectedBorderSx";

interface ColorMixerSectionProps {
  settings: ParsedSettings;
  getNestedValue: (obj: unknown, path: string) => unknown;
  renderSettingRow: (
    label: string,
    value: unknown,
    spectrum?: string,
    key?: string
  ) => React.ReactNode;
}

const ColorMixerSection: React.FC<ColorMixerSectionProps> = ({
  settings,
  getNestedValue,
  renderSettingRow,
}) => {
  const [selectedColor, setSelectedColor] = useState("blue");

  const getColorMixerSpectrum = (key: string) => {
    if (key === "hue") {
      return COLOR_MIXER_HUE_SPECTRUM;
    }
    return `linear-gradient(to right, #888, ${
      COLOR_MIXER_COLORS[selectedColor as keyof typeof COLOR_MIXER_COLORS]
    }, #888)`;
  };

  return (
    <Box sx={{ mt: 3, mb: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Color Mixer
      </Typography>
      <Box sx={{ mb: 2 }}>
        {COLOR_ORDER.map(({ key, color }) => (
          <Box
            key={key}
            sx={{
              display: "inline-block",
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: color,
              margin: 0.5,
              cursor: "pointer",
              ...selectedBorderSx(selectedColor === key),
            }}
            onClick={() => setSelectedColor(key)}
          />
        ))}
      </Box>
      {COLOR_MIXER_SETTINGS.map(({ key, label }) => {
        const rawValue =
          getNestedValue(
            settings.settings,
            `colorAdjustments.${selectedColor}.${key}`
          ) || 0;

        const displayValue = Number(rawValue) / 100;

        return renderSettingRow(
          label,
          displayValue,
          getColorMixerSpectrum(key),
          `${selectedColor}_${key}`
        );
      })}
    </Box>
  );
};

export default ColorMixerSection;
