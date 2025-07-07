import React from "react";
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import SettingSliderDisplay from "./SettingSliderDisplay";

interface Setting {
  label: string;
  key: string;
  value: number | string;
  spectrum?: string;
  sectionTitle?: string;
}

interface SettingsDisplayProps {
  settings: Setting[];
  formatValue?: (value: any) => string;
}

const SettingsDisplay: React.FC<SettingsDisplayProps> = ({
  settings,
  formatValue = (value) => value?.toString() || "0",
}) => {
  const [selectedColor, setSelectedColor] = React.useState("blue");

  const colorOrder = [
    { key: "red", color: "#ff3b30" },
    { key: "orange", color: "#ff9500" },
    { key: "yellow", color: "#ffcc00" },
    { key: "green", color: "#4cd964" },
    { key: "aqua", color: "#5ac8fa" },
    { key: "blue", color: "#007aff" },
    { key: "purple", color: "#af52de" },
    { key: "magenta", color: "#ff2d55" },
  ];

  // Helper to get a muted color for each channel
  const colorMixerColor = (key: string) => {
    switch (key) {
      case "red":
        return "#b94a4a";
      case "orange":
        return "#b98a4a";
      case "yellow":
        return "#b9b84a";
      case "green":
        return "#4ab96b";
      case "aqua":
        return "#4ab9b9";
      case "blue":
        return "#4a6ab9";
      case "purple":
        return "#8a4ab9";
      case "magenta":
        return "#b94a8a";
      default:
        return "#888";
    }
  };

  // Check if this is a color mixer section
  const isColorMixer = settings.some(
    (setting) =>
      setting.key === "hue" ||
      setting.key === "saturation" ||
      setting.key === "luminance"
  );

  return (
    <Box>
      {/* Color Mixer Toggle Buttons */}
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
                    border:
                      selectedColor === key
                        ? "2px solid #fff"
                        : "2px solid #222",
                  }}
                />
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      )}

      {/* Settings */}
      {settings.map((setting, index) => {
        // Skip color mixer settings if we're not in color mixer mode
        if (
          isColorMixer &&
          !["hue", "saturation", "luminance"].includes(setting.key)
        ) {
          return null;
        }

        // For color mixer, use the selected color
        const actualValue =
          isColorMixer && setting.key === "hue"
            ? formatValue(0) // This would need to be connected to actual color mixer data
            : formatValue(setting.value);

        const actualSpectrum =
          isColorMixer && setting.key === "hue"
            ? "linear-gradient(to right, #b94a4a, #b98a4a, #b9b84a, #4ab96b, #4ab9b9, #4a6ab9, #8a4ab9, #b94a8a, #b94a4a)"
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
            {/* Section Title */}
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

            {/* Setting Row */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                minHeight: 32, // Ensure consistent row height
              }}
            >
              {/* Label - Responsive width with text wrapping */}
              <Box
                sx={{
                  width: { xs: 110, sm: 110, md: 180 }, // Responsive: 110px on xs/sm, 180px on md+
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
                    fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.875rem" }, // Smaller font on mobile
                  }}
                >
                  {setting.label}
                </Typography>
              </Box>

              {/* Slider - Takes up all available space */}
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

              {/* Value - Fixed width */}
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
                    fontSize: "0.875rem",
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
