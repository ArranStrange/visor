import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { ParsedSettings } from "./XmpParser";
import {
  COLOR_ORDER,
  COLOR_MIXER_COLORS,
  COLOR_MIXER_SETTINGS,
} from "../../constants/xmpSettingsConfig";

interface ColorMixerSectionProps {
  settings: ParsedSettings;
  getNestedValue: (obj: any, path: string) => any;
  renderSettingRow: (
    label: string,
    value: any,
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
      return "linear-gradient(to right, #b94a4a, #b98a4a, #b9b84a, #4ab96b, #4ab9b9, #4a6ab9, #8a4ab9, #b94a8a, #b94a4a)";
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
              border:
                selectedColor === key ? "2px solid #fff" : "2px solid #222",
              margin: 0.5,
              cursor: "pointer",
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
