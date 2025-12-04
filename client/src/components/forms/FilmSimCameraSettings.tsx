import React from "react";
import { Box, Typography } from "@mui/material";
import WhiteBalanceGrid from "../settings/WhiteBalanceGrid";

interface FilmSimSettings {
  filmSimulation?: string;
  grainEffect?: string;
  colorChromeEffect?: string;
  colorChromeFxBlue?: string;
  dynamicRange?: number | null;
  highlight?: number;
  shadow?: number;
  color?: number;
  sharpness?: number;
  noiseReduction?: number;
  clarity?: number;
  whiteBalance?: string;
  wbShift?: {
    r: number;
    b: number;
  };
}

interface FilmSim {
  settings?: FilmSimSettings;
}

interface FilmSimCameraSettingsProps {
  filmSim: FilmSim;
}

const formatSettingValue = (value: any) => {
  if (value === undefined || value === null) return "N/A";
  if (typeof value === "number") return value.toString();
  return value;
};

const FilmSimCameraSettings: React.FC<FilmSimCameraSettingsProps> = ({
  filmSim,
}) => {
  const settings = filmSim.settings || {};
  const settingsList = [
    {
      key: "filmSimulation",
      label: "Film Simulation",
      value: settings?.filmSimulation,
    },
    {
      key: "grainEffect",
      label: "Grain Effect",
      value: settings?.grainEffect,
    },
    {
      key: "colorChromeEffect",
      label: "Color Chrome Effect",
      value: settings?.colorChromeEffect,
    },
    {
      key: "colorChromeFxBlue",
      label: "Color Chrome FX Blue",
      value: settings?.colorChromeFxBlue,
    },
    {
      key: "dynamicRange",
      label: "Dynamic Range",
      value: settings?.dynamicRange,
    },
    {
      key: "highlight",
      label: "Highlight Tone",
      value: settings?.highlight,
    },
    {
      key: "shadow",
      label: "Shadow Tone",
      value: settings?.shadow,
    },
    {
      key: "color",
      label: "Color",
      value: settings?.color,
    },
    {
      key: "sharpness",
      label: "Sharpness",
      value: settings?.sharpness,
    },
    {
      key: "noiseReduction",
      label: "Noise Reduction",
      value: settings?.noiseReduction,
    },
    {
      key: "clarity",
      label: "Clarity",
      value: settings?.clarity,
    },
  ];

  return (
    <Box mb={4}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontWeight: 700, letterSpacing: 1, pl: 1, pt: 1 }}
      >
        In-Camera Settings
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 0, md: 4 },
        }}
      >
        {/* Left*/}
        <Box sx={{ flex: 1, width: { xs: "100%", md: "50%" } }}>
          {settingsList.map((setting) => (
            <Box
              key={setting.key}
              sx={{
                width: "100%",
                bgcolor: "grey.900",
                color: "grey.100",
                borderRadius: 2,
                px: { xs: 2, sm: 3 },
                py: { xs: 0.25, sm: 0.5 },
                position: "relative",
                display: "flex",
                alignItems: "center",
                fontWeight: 600,
                fontSize: { xs: "0.80rem", sm: "0.95rem" },
                letterSpacing: 0.2,
                minHeight: { xs: 22, sm: 30 },
                mb: 2,
              }}
            >
              <span
                style={{
                  opacity: 0.6,
                  width: "50%",
                  textAlign: "start",
                  display: "inline-block",
                  zIndex: 1,
                }}
              >
                {setting.label}
              </span>
              <Box
                sx={{
                  position: "absolute",
                  left: "50%",
                  top: 6,
                  bottom: 6,
                  height: "auto",
                  borderLeft: "1px solid #444",
                  transform: "translateX(-50%)",
                  zIndex: 2,
                }}
              />
              <span
                style={{
                  fontWeight: 700,
                  width: "50%",
                  textAlign: "end",
                  display: "inline-block",
                  zIndex: 1,
                }}
              >
                {formatSettingValue(setting.value)}
              </span>
            </Box>
          ))}
        </Box>
        {/* Right*/}
        <Box
          sx={{
            flex: 1,
            width: { xs: "100%", md: "50%" },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: { md: "space-between" },
            minHeight: { md: 340 },
          }}
        >
          {settings?.whiteBalance && (
            <Box
              sx={{
                width: "100%",
                bgcolor: "grey.900",
                color: "grey.100",
                borderRadius: 2,
                px: { xs: 2, sm: 3 },
                py: { xs: 0.25, sm: 0.5 },
                position: "relative",
                display: "flex",
                alignItems: "center",
                fontWeight: 600,
                fontSize: { xs: "0.80rem", sm: "0.95rem" },
                letterSpacing: 0.2,
                minHeight: { xs: 22, sm: 30 },
                mb: 2,
              }}
            >
              <span
                style={{
                  opacity: 0.6,
                  width: "50%",
                  textAlign: "start",
                  display: "inline-block",
                  zIndex: 1,
                }}
              >
                White Balance
              </span>
              <Box
                sx={{
                  position: "absolute",
                  left: "50%",
                  top: 6,
                  bottom: 6,
                  height: "auto",
                  borderLeft: "1px solid #444",
                  transform: "translateX(-50%)",
                  zIndex: 2,
                }}
              />
              <span
                style={{
                  fontWeight: 700,
                  width: "50%",
                  textAlign: "end",
                  display: "inline-block",
                  zIndex: 1,
                }}
              >
                {formatSettingValue(settings.whiteBalance)}
              </span>
            </Box>
          )}

          {settings?.wbShift && (
            <Box
              sx={{
                width: "100%",
                bgcolor: "grey.900",
                color: "grey.100",
                borderRadius: 2,
                px: { xs: 2, sm: 3 },
                py: { xs: 0.25, sm: 0.5 },
                position: "relative",
                display: "flex",
                alignItems: "center",
                fontWeight: 600,
                fontSize: { xs: "0.80rem", sm: "0.95rem" },
                letterSpacing: 0.2,
                minHeight: { xs: 22, sm: 30 },
                mb: 2,
              }}
            >
              <span
                style={{
                  opacity: 0.6,
                  width: "50%",
                  textAlign: "start",
                  display: "inline-block",
                  zIndex: 1,
                }}
              >
                WB Shift
              </span>
              <Box
                sx={{
                  position: "absolute",
                  left: "50%",
                  top: 6,
                  bottom: 6,
                  height: "auto",
                  borderLeft: "1px solid #444",
                  transform: "translateX(-50%)",
                  zIndex: 2,
                }}
              />
              <span
                style={{
                  fontWeight: 700,
                  width: "50%",
                  textAlign: "end",
                  display: "inline-block",
                  zIndex: 1,
                }}
              >
                {`R${settings.wbShift.r} / B${settings.wbShift.b}`}
              </span>
            </Box>
          )}

          {settings?.wbShift && (
            <Box
              sx={{
                mt: { xs: 3, md: 0 },
                px: 1,
                mx: "auto",
                display: "flex",
                justifyContent: "center",
                flexGrow: 1,
                alignItems: "center",
              }}
            >
              <WhiteBalanceGrid value={settings.wbShift} onChange={() => {}} />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default FilmSimCameraSettings;
