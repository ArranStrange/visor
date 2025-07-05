import React, { useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SettingSliderDisplay from "./SettingSliderDisplay";
import ToneCurve from "./ToneCurve";
import ColorGradingWheels from "./ColorGradingWheels";
import { ParsedSettings } from "./XmpParser";

interface XmpSettingsDisplayProps {
  settings: ParsedSettings;
}

const XmpSettingsDisplay: React.FC<XmpSettingsDisplayProps> = ({
  settings,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedColor, setSelectedColor] = useState("blue");

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

  const formatSettingValue = (value: any) => {
    if (value === undefined || value === null) return "0";
    const num = Number(value);
    if (isNaN(num)) return "0";
    if (Number.isInteger(num)) return num.toString();
    return num.toFixed(1);
  };

  const formatToneCurveData = (curveData: any) => {
    if (!curveData) return [0, 64, 128, 192, 255];

    const inputPoints = [0, 64, 128, 192, 255];
    const outputPoints = inputPoints.map((input) => {
      const lowerPoint = curveData.reduce((prev: any, curr: any) => {
        return curr.x <= input && (!prev || curr.x > prev.x) ? curr : prev;
      }, null);

      const upperPoint = curveData.reduce((prev: any, curr: any) => {
        return curr.x >= input && (!prev || curr.x < prev.x) ? curr : prev;
      }, null);

      if (!lowerPoint || !upperPoint) return input;
      if (lowerPoint.x === upperPoint.x) return lowerPoint.y;

      const ratio = (input - lowerPoint.x) / (upperPoint.x - lowerPoint.x);
      return Math.round(lowerPoint.y + ratio * (upperPoint.y - lowerPoint.y));
    });

    return outputPoints;
  };

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

  // Format tone curve data
  const toneCurveData = {
    rgb: formatToneCurveData(settings.toneCurve?.rgb),
    red: formatToneCurveData(settings.toneCurve?.red),
    green: formatToneCurveData(settings.toneCurve?.green),
    blue: formatToneCurveData(settings.toneCurve?.blue),
  };

  // Render a setting row with consistent layout
  const renderSettingRow = (
    label: string,
    value: any,
    spectrum?: string,
    key?: string
  ) => (
    <Box
      key={key || label}
      sx={{
        display: "flex",
        alignItems: "center",
        mb: 1,
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? 1 : 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minWidth: isMobile ? "auto" : 200,
          width: isMobile ? "100%" : "auto",
          mb: isMobile ? 0.5 : 0,
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ opacity: 0.7 }}
        >
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: "bold",
            color: "text.primary",
          }}
        >
          {formatSettingValue(value)}
        </Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          mx: isMobile ? 0 : 2,
          width: isMobile ? "100%" : "auto",
          minWidth: isMobile ? "auto" : 200, // Ensure consistent slider width
        }}
      >
        <SettingSliderDisplay
          label={label}
          value={formatSettingValue(value)}
          spectrum={spectrum}
        />
      </Box>
    </Box>
  );

  // Helper function to safely access nested properties
  const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((current, key) => {
      return current && typeof current === "object" ? current[key] : undefined;
    }, obj);
  };

  return (
    <Box>
      {/* Light */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Light
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {[
              { key: "exposure", label: "Exposure" },
              { key: "contrast", label: "Contrast" },
              { key: "highlights", label: "Highlights" },
              { key: "shadows", label: "Shadows" },
              { key: "whites", label: "Whites" },
              { key: "blacks", label: "Blacks" },
            ].map(({ key, label }) =>
              renderSettingRow(
                label,
                (getNestedValue(settings.settings, key) || 0) / 100,
                undefined,
                key
              )
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Tone Curve */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Tone Curve
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ToneCurve curves={toneCurveData} />
        </AccordionDetails>
      </Accordion>

      {/* Color */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Color
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" gutterBottom>
            White Balance: {settings.whiteBalance || "Custom"}
          </Typography>
          {[
            {
              label: "Temp",
              key: "temp",
              spectrum:
                "linear-gradient(to right, #4a90e2, #eaeaea, #f7e7b6, #e2c44a)",
            },
            {
              label: "Tint",
              key: "tint",
              spectrum: "linear-gradient(to right, #4ae2a1, #eaeaea, #e24ad6)",
            },
            {
              label: "Vibrance",
              key: "vibrance",
              spectrum:
                "linear-gradient(to right, #444, #3b4a6a, #3b6a4a, #6a6a3b, #6a4a3b, #b94a4a)",
            },
            {
              label: "Saturation",
              key: "saturation",
              spectrum:
                "linear-gradient(to right, #444, #3b4a6a, #3b6a4a, #6a6a3b, #6a4a3b, #b94a4a)",
            },
          ].map(({ label, key, spectrum }) =>
            renderSettingRow(
              label,
              getNestedValue(settings.settings, key) || 0,
              spectrum,
              key
            )
          )}

          {/* Color Mixer */}
          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Color Mixer
            </Typography>
            <Box sx={{ mb: 2 }}>
              {colorOrder.map(({ key, color }) => (
                <Box
                  key={key}
                  sx={{
                    display: "inline-block",
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: color,
                    border:
                      selectedColor === key
                        ? "2px solid #fff"
                        : "2px solid #222",
                    margin: 0.5,
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedColor(key)}
                />
              ))}
            </Box>
            {[
              { key: "hue", label: "Hue" },
              { key: "saturation", label: "Saturation" },
              { key: "luminance", label: "Luminance" },
            ].map(({ key, label }) =>
              renderSettingRow(
                label,
                getNestedValue(
                  settings.settings,
                  `colorAdjustments.${selectedColor}.${key}`
                ) || 0,
                key === "hue"
                  ? "linear-gradient(to right, #b94a4a, #b98a4a, #b9b84a, #4ab96b, #4ab9b9, #4a6ab9, #8a4ab9, #b94a8a, #b94a4a)"
                  : `linear-gradient(to right, #888, ${colorMixerColor(
                      selectedColor
                    )}, #888)`,
                `${selectedColor}_${key}`
              )
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Effects */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Effects
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {[
              { key: "clarity", label: "Clarity" },
              { key: "dehaze", label: "Dehaze" },
              { key: "texture", label: "Texture" },
            ].map(({ key, label }) =>
              renderSettingRow(
                label,
                (getNestedValue(settings.settings, key) || 0) / 100,
                undefined,
                key
              )
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Split Toning */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Split Toning
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Shadows
            </Typography>
            {[
              { key: "shadowHue", label: "Hue" },
              { key: "shadowSaturation", label: "Saturation" },
            ].map(({ key, label }) =>
              renderSettingRow(
                label,
                (getNestedValue(settings.splitToning, key) || 0) / 100,
                undefined,
                key
              )
            )}

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              Highlights
            </Typography>
            {[
              { key: "highlightHue", label: "Hue" },
              { key: "highlightSaturation", label: "Saturation" },
            ].map(({ key, label }) =>
              renderSettingRow(
                label,
                (getNestedValue(settings.splitToning, key) || 0) / 100,
                undefined,
                key
              )
            )}

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              Balance
            </Typography>
            {renderSettingRow(
              "Balance",
              (getNestedValue(settings.splitToning, "balance") || 0) / 100,
              undefined,
              "balance"
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Grain */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Grain
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {[
              { key: "grainAmount", label: "Amount" },
              { key: "grainSize", label: "Size" },
              { key: "grainFrequency", label: "Frequency" },
            ].map(({ key, label }) =>
              renderSettingRow(
                label,
                (getNestedValue(settings.effects, key) || 0) / 100,
                undefined,
                key
              )
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Detail */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Detail
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Sharpening
            </Typography>
            {[
              { key: "sharpening", label: "Amount" },
              { key: "sharpenRadius", label: "Radius" },
              { key: "sharpenDetail", label: "Detail" },
              { key: "sharpenEdgeMasking", label: "Edge Masking" },
            ].map(({ key, label }) =>
              renderSettingRow(
                label,
                (getNestedValue(settings.settings, key) || 0) / 100,
                undefined,
                key
              )
            )}

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              Noise Reduction
            </Typography>
            {[
              { key: "luminanceSmoothing", label: "Luminance Smoothing" },
              { key: "luminanceDetail", label: "Luminance Detail" },
              { key: "luminanceContrast", label: "Luminance Contrast" },
            ].map(({ key, label }) =>
              renderSettingRow(
                label,
                (getNestedValue(settings.settings, key) || 0) / 100,
                undefined,
                key
              )
            )}
            {[
              { key: "color", label: "Color Noise Reduction" },
              { key: "detail", label: "Color Detail" },
              { key: "smoothness", label: "Color Smoothness" },
            ].map(({ key, label }) =>
              renderSettingRow(
                label,
                (getNestedValue(settings.settings, `noiseReduction.${key}`) ||
                  0) / 100,
                undefined,
                `noise_${key}`
              )
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Color Grading */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Color Grading
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <ColorGradingWheels
              shadowHue={settings.colorGrading?.shadowHue || 0}
              shadowSat={settings.colorGrading?.shadowSat || 0}
              shadowLuminance={settings.colorGrading?.shadowLuminance || 0}
              midtoneHue={settings.colorGrading?.midtoneHue || 0}
              midtoneSat={settings.colorGrading?.midtoneSat || 0}
              midtoneLuminance={settings.colorGrading?.midtoneLuminance || 0}
              highlightHue={settings.colorGrading?.highlightHue || 0}
              highlightSat={settings.colorGrading?.highlightSat || 0}
              highlightLuminance={
                settings.colorGrading?.highlightLuminance || 0
              }
              blending={settings.colorGrading?.blending || 50}
              balance={settings.colorGrading?.balance || 0}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Lens Corrections */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Lens Corrections
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {renderSettingRow(
              "Manual Distortion",
              (getNestedValue(
                settings.lensCorrections,
                "lensManualDistortionAmount"
              ) || 0) / 100,
              undefined,
              "lensManualDistortionAmount"
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Profile: {settings.lensCorrections?.lensProfileName || "None"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Perspective:{" "}
              {settings.lensCorrections?.perspectiveUpright || "None"}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Optics */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Optics
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {[
              { key: "vignetteAmount", label: "Vignette Amount" },
              { key: "vignetteMidpoint", label: "Vignette Midpoint" },
            ].map(({ key, label }) =>
              renderSettingRow(
                label,
                (getNestedValue(settings.optics, key) || 0) / 100,
                undefined,
                key
              )
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Transform */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Transform
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {[
              { key: "perspectiveVertical", label: "Perspective Vertical" },
              { key: "perspectiveHorizontal", label: "Perspective Horizontal" },
              { key: "perspectiveRotate", label: "Perspective Rotate" },
              { key: "perspectiveScale", label: "Perspective Scale" },
              { key: "perspectiveAspect", label: "Perspective Aspect" },
            ].map(({ key, label }) =>
              renderSettingRow(
                label,
                (getNestedValue(settings.transform, key) || 0) / 100,
                undefined,
                key
              )
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Effects (Enhanced) */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Effects (Enhanced)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {[
              {
                key: "postCropVignetteAmount",
                label: "Post-Crop Vignette Amount",
              },
              {
                key: "postCropVignetteMidpoint",
                label: "Post-Crop Vignette Midpoint",
              },
              {
                key: "postCropVignetteFeather",
                label: "Post-Crop Vignette Feather",
              },
              {
                key: "postCropVignetteRoundness",
                label: "Post-Crop Vignette Roundness",
              },
            ].map(({ key, label }) =>
              renderSettingRow(
                label,
                (getNestedValue(settings.effects, key) || 0) / 100,
                undefined,
                key
              )
            )}
            <Typography variant="body2" color="text.secondary">
              Post-Crop Vignette Style:{" "}
              {settings.effects?.postCropVignetteStyle || "None"}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Calibration */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Calibration
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {[
              {
                key: "cameraCalibrationRedPrimaryHue",
                label: "Red Primary Hue",
              },
              {
                key: "cameraCalibrationRedPrimarySaturation",
                label: "Red Primary Saturation",
              },
              {
                key: "cameraCalibrationGreenPrimaryHue",
                label: "Green Primary Hue",
              },
              {
                key: "cameraCalibrationGreenPrimarySaturation",
                label: "Green Primary Saturation",
              },
              {
                key: "cameraCalibrationBluePrimaryHue",
                label: "Blue Primary Hue",
              },
              {
                key: "cameraCalibrationBluePrimarySaturation",
                label: "Blue Primary Saturation",
              },
              { key: "cameraCalibrationShadowTint", label: "Shadow Tint" },
            ].map(({ key, label }) =>
              renderSettingRow(
                label,
                (getNestedValue(settings.calibration, key) || 0) / 100,
                undefined,
                key
              )
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Crop & Orientation */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Crop & Orientation
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Crop
            </Typography>
            {[
              { key: "cropTop", label: "Top" },
              { key: "cropLeft", label: "Left" },
              { key: "cropBottom", label: "Bottom" },
              { key: "cropRight", label: "Right" },
              { key: "cropAngle", label: "Angle" },
            ].map(({ key, label }) =>
              renderSettingRow(
                label,
                (getNestedValue(settings.crop, key) || 0) / 100,
                undefined,
                key
              )
            )}
            <Typography variant="body2" color="text.secondary">
              Constrain to Warp:{" "}
              {settings.crop?.cropConstrainToWarp ? "Yes" : "No"}
            </Typography>

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              Orientation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {settings.orientation || "None"}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Metadata */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Metadata
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Rating: {settings.metadata?.rating || "None"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Label: {settings.metadata?.label || "None"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Creator: {settings.metadata?.creator || "Unknown"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Date Created: {settings.metadata?.dateCreated || "Unknown"}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Camera & Profile Metadata */}
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            Camera & Profile
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Process Version: {settings.version || "Unknown"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Camera Profile: {settings.cameraProfile || "Unknown"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Profile Name: {settings.profileName || "Unknown"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              White Balance: {settings.whiteBalance || "Unknown"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Look Table: {settings.lookTableName || "None"}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default XmpSettingsDisplay;
