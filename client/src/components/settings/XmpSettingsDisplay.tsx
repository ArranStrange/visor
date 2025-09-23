import React from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import SettingSliderDisplay from "../forms/SettingSliderDisplay";
import XmpSettingsAccordion from "./XmpSettingsAccordion";
import { ParsedSettings } from "./XmpParser";
import { XMP_SECTIONS } from "../../constants/xmpSettingsConfig";

interface XmpSettingsDisplayProps {
  settings: ParsedSettings;
}

const XmpSettingsDisplay: React.FC<XmpSettingsDisplayProps> = ({
  settings,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const formatSettingValue = (value: any) => {
    if (value === undefined || value === null) return "0";
    const num = Number(value);
    if (isNaN(num)) return "0";
    if (Number.isInteger(num)) return num.toString();
    return num.toFixed(1);
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
          minWidth: isMobile ? "auto" : 200,
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
      {XMP_SECTIONS.map((section) => (
        <XmpSettingsAccordion
          key={section.title}
          section={section}
          settings={settings}
          getNestedValue={getNestedValue}
          renderSettingRow={renderSettingRow}
        />
      ))}
    </Box>
  );
};

export default XmpSettingsDisplay;
