import React from "react";
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import SettingSliderDisplay from "@/features/settings/components/SettingSliderDisplay";
import {
  COLOR_ORDER,
  COLOR_MIXER_COLORS,
  COLOR_MIXER_HUE_SPECTRUM,
} from "@/features/settings/utils/xmpSettingsConfig";
import { selectedBorderSx } from "@/features/settings/utils/selectedBorderSx";

interface Setting {
  label: string;
  key: string;
  value: number | string;
  spectrum?: string;
  sectionTitle?: string;
}

interface SettingsDisplayProps {
  settings: Setting[];
  formatValue?: (value: unknown) => string;
}

const SettingsDisplay: React.FC<SettingsDisplayProps> = ({
  settings,
  formatValue = (value) => (value == null ? "0" : String(value) || "0"),
}) => {
  const [selectedColor, setSelectedColor] = React.useState("blue");

  const colorOrder = COLOR_ORDER;

  const colorMixerColor = (key: string) =>
    COLOR_MIXER_COLORS[key as keyof typeof COLOR_MIXER_COLORS] ?? "#888";

  const isColorMixer = settings.some(
    (setting) =>
      setting.key === "hue" ||
      setting.key === "saturation" ||
      setting.key === "luminance"
  );

  return (
    <Box>
      {isColorMixer && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Color Mixer
          </Typography>
          <ToggleButtonGroup
            value={selectedColor}
            exclusive
            onChange={(_, v) => v && setSelectedColor(v)}
            sx={{ mb: 2 }}
          >
            {colorOrder.map(({ key, color }) => (
              <ToggleButton
                key={key}
                value={key}
                sx={{ p: 0.5, mx: 0.5, border: "none" }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: color,
                    ...selectedBorderSx(selectedColor === key),
                  }}
                />
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      )}

      {settings.map((setting, index) => {
        if (
          isColorMixer &&
          !["hue", "saturation", "luminance"].includes(setting.key)
        ) {
          return null;
        }

        const actualValue =
          isColorMixer && setting.key === "hue"
            ? formatValue(0)
            : formatValue(setting.value);

        const actualSpectrum =
          isColorMixer && setting.key === "hue"
            ? COLOR_MIXER_HUE_SPECTRUM
            : isColorMixer && setting.key === "saturation"
              ? `linear-gradient(to right, #888, ${colorMixerColor(
                  selectedColor
                )}, #888)`
              : isColorMixer && setting.key === "luminance"
                ? `linear-gradient(to right, #222, ${colorMixerColor(
                    selectedColor
                  )}, #fff)`
                : setting.spectrum;

        return (
          <Box key={`${setting.key}-${index}`}>
            {setting.sectionTitle && (
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
                sx={{ mt: index > 0 ? 2 : 0 }}
              >
                {setting.sectionTitle}
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                minHeight: 32,
              }}
            >
              <Box
                sx={{
                  width: { xs: 110, sm: 110, md: 180 },
                  mr: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                    lineHeight: 1.2,
                    fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.875rem" },
                  }}
                >
                  {setting.label}
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  mx: 2,
                }}
              >
                <SettingSliderDisplay
                  label={setting.label}
                  value={actualValue}
                  spectrum={actualSpectrum}
                />
              </Box>

              <Box
                sx={{
                  width: 60,
                  textAlign: "right",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  {actualValue}
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default SettingsDisplay;
