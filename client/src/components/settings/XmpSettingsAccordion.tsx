import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ToneCurve from "./ToneCurve";
import ColorGradingWheels from "./ColorGradingWheels";
import ColorMixerSection from "./ColorMixerSection";
import { ParsedSettings } from "../../types/xmpSettings";
import {
  SectionConfig,
  SettingConfig,
} from "../../constants/xmpSettingsConfig";

interface XmpSettingsAccordionProps {
  section: SectionConfig;
  settings: ParsedSettings;
  getNestedValue: (obj: any, path: string) => any;
  renderSettingRow: (
    label: string,
    value: any,
    spectrum?: string,
    key?: string
  ) => React.ReactNode;
}

const XmpSettingsAccordion: React.FC<XmpSettingsAccordionProps> = ({
  section,
  settings,
  getNestedValue,
  renderSettingRow,
}) => {
  const renderSettings = (settingsList: SettingConfig[], basePath?: string) => {
    return settingsList.map(({ key, label, spectrum, path, divider = 1 }) => {
      const fullPath = path
        ? `${path}.${key}`
        : basePath
        ? `${basePath}.${key}`
        : key;
      const value = getNestedValue(settings, fullPath) || 0;
      const processedValue = divider !== 1 ? value / divider : value;

      return renderSettingRow(label, processedValue, spectrum, key);
    });
  };

  const renderSubsections = () => {
    if (!section.subsections) return null;

    return section.subsections.map((subsection, index) => (
      <Box key={index}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          gutterBottom
          sx={{ mt: index > 0 ? 2 : 0 }}
        >
          {subsection.title}
        </Typography>
        {renderSettings(subsection.settings)}
      </Box>
    ));
  };

  const renderSpecialContent = () => {
    switch (section.title) {
      case "Tone Curve":
        return (
          <ToneCurve
            curves={{
              rgb: formatToneCurveData(settings.toneCurve?.rgb),
              red: formatToneCurveData(settings.toneCurve?.red),
              green: formatToneCurveData(settings.toneCurve?.green),
              blue: formatToneCurveData(settings.toneCurve?.blue),
            }}
          />
        );

      case "Color":
        return (
          <Box>
            <Typography variant="body2" gutterBottom>
              White Balance: {settings.whiteBalance || "Custom"}
            </Typography>
            {section.settings && renderSettings(section.settings)}
            <ColorMixerSection
              settings={settings}
              getNestedValue={getNestedValue}
              renderSettingRow={renderSettingRow}
            />
          </Box>
        );

      case "Color Grading":
        return (
          <ColorGradingWheels
            shadowHue={settings.colorGrading?.shadowHue || 0}
            shadowSat={settings.colorGrading?.shadowSat || 0}
            shadowLuminance={settings.colorGrading?.shadowLuminance || 0}
            midtoneHue={settings.colorGrading?.midtoneHue || 0}
            midtoneSat={settings.colorGrading?.midtoneSat || 0}
            midtoneLuminance={settings.colorGrading?.midtoneLuminance || 0}
            highlightHue={settings.colorGrading?.highlightHue || 0}
            highlightSat={settings.colorGrading?.highlightSat || 0}
            highlightLuminance={settings.colorGrading?.highlightLuminance || 0}
            blending={settings.colorGrading?.blending || 50}
            balance={settings.colorGrading?.balance || 0}
          />
        );

      case "Metadata":
        return (
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
        );

      case "Camera & Profile":
        return (
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
        );

      case "Lens Corrections":
        return (
          <Box>
            {section.settings && renderSettings(section.settings)}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Profile: {settings.lensCorrections?.lensProfileName || "None"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Perspective:{" "}
              {settings.lensCorrections?.perspectiveUpright || "None"}
            </Typography>
          </Box>
        );

      case "Effects (Enhanced)":
        return (
          <Box>
            {section.settings && renderSettings(section.settings)}
            <Typography variant="body2" color="text.secondary">
              Post-Crop Vignette Style:{" "}
              {settings.effects?.postCropVignetteStyle || "None"}
            </Typography>
          </Box>
        );

      case "Crop & Orientation":
        return (
          <Box>
            {renderSubsections()}
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
        );

      default:
        return section.subsections
          ? renderSubsections()
          : section.settings
          ? renderSettings(section.settings)
          : null;
    }
  };

  return (
    <Accordion sx={{ backgroundColor: "background.default" }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6" fontWeight="bold">
          {section.title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>{renderSpecialContent()}</AccordionDetails>
    </Accordion>
  );
};

// Helper function for tone curve formatting
const formatToneCurveData = (curveData: any) => {
  // Handle null, undefined, or empty arrays
  if (!curveData || !Array.isArray(curveData) || curveData.length === 0) {
    return [0, 64, 128, 192, 255];
  }

  // Sort points by x value to ensure proper interpolation
  const sortedPoints = [...curveData].sort((a, b) => (a?.x || 0) - (b?.x || 0));

  const inputPoints = [0, 64, 128, 192, 255];
  const outputPoints = inputPoints.map((input) => {
    // Find the two points that surround this input value
    const lowerPoint = sortedPoints.reduce((prev: any, curr: any) => {
      if (!curr || typeof curr.x === "undefined") return prev;
      return curr.x <= input && (!prev || curr.x > prev.x) ? curr : prev;
    }, null);

    const upperPoint = sortedPoints.reduce((prev: any, curr: any) => {
      if (!curr || typeof curr.x === "undefined") return prev;
      return curr.x >= input && (!prev || curr.x < prev.x) ? curr : prev;
    }, null);

    if (!lowerPoint || !upperPoint) return input;
    if (lowerPoint.x === upperPoint.x) return lowerPoint.y;

    const ratio = (input - lowerPoint.x) / (upperPoint.x - lowerPoint.x);
    return Math.round(lowerPoint.y + ratio * (upperPoint.y - lowerPoint.y));
  });

  return outputPoints;
};

export default XmpSettingsAccordion;
