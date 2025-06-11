import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Slider,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import ToneCurve from "./ToneCurve";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface ParsedSettings {
  version?: string;
  processVersion?: string;
  whiteBalance?: string;
  cameraProfile?: string;
  toneCurveName?: string;
  exposure?: number;
  contrast?: number;
  highlights?: number;
  shadows?: number;
  whites?: number;
  blacks?: number;
  texture?: number;
  clarity?: number;
  dehaze?: number;
  grain?: {
    amount: number;
    size: number;
    frequency: number;
  };
  vignette?: {
    amount: number;
  };
  colorAdjustments?: {
    red?: {
      hue: number;
      saturation: number;
      luminance: number;
    };
    orange?: {
      saturation: number;
      luminance: number;
    };
    yellow?: {
      hue: number;
      saturation: number;
      luminance: number;
    };
    green?: {
      hue: number;
      saturation: number;
    };
    blue?: {
      hue: number;
      saturation: number;
    };
  };
  splitToning?: {
    shadowHue: number;
    shadowSaturation: number;
    highlightHue: number;
    highlightSaturation: number;
    balance: number;
  };
  toneCurve?: {
    rgb: Array<{ x: number; y: number }>;
    red: Array<{ x: number; y: number }>;
    green: Array<{ x: number; y: number }>;
    blue: Array<{ x: number; y: number }>;
  };
}

interface XmpParserProps {
  onSettingsParsed: (settings: ParsedSettings) => void;
}

const XmpParser = ({ onSettingsParsed }: XmpParserProps) => {
  const [parsedSettings, setParsedSettings] = useState<ParsedSettings | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, "text/xml");

        // Get the description element
        const description = xmlDoc.getElementsByTagName("rdf:Description")[0];
        if (!description) {
          throw new Error("No settings found in XMP file");
        }

        const settings: ParsedSettings = {};

        // Helper function to get attribute value
        const getAttr = (name: string): string => {
          return description.getAttribute(`crs:${name}`) || "0";
        };

        // Basic Settings
        settings.version = getAttr("Version");
        settings.processVersion = getAttr("ProcessVersion");
        settings.whiteBalance = getAttr("WhiteBalance");
        settings.cameraProfile = getAttr("CameraProfile");
        settings.toneCurveName = getAttr("ToneCurveName2012");

        // Exposure and Tone
        settings.exposure = parseFloat(getAttr("Exposure2012"));
        settings.contrast = parseFloat(getAttr("Contrast2012"));
        settings.highlights = parseFloat(getAttr("Highlights2012"));
        settings.shadows = parseFloat(getAttr("Shadows2012"));
        settings.whites = parseFloat(getAttr("Whites2012"));
        settings.blacks = parseFloat(getAttr("Blacks2012"));
        settings.texture = parseFloat(getAttr("Texture"));
        settings.clarity = parseFloat(getAttr("Clarity2012"));
        settings.dehaze = parseFloat(getAttr("Dehaze"));

        // Grain Settings
        settings.grain = {
          amount: parseFloat(getAttr("GrainAmount")),
          size: parseFloat(getAttr("GrainSize")),
          frequency: parseFloat(getAttr("GrainFrequency")),
        };

        // Vignette
        settings.vignette = {
          amount: parseFloat(getAttr("PostCropVignetteAmount")),
        };

        // Color Adjustments
        settings.colorAdjustments = {
          red: {
            hue: parseFloat(getAttr("RedHue")),
            saturation: parseFloat(getAttr("RedSaturation")),
            luminance: parseFloat(getAttr("RedLuminance")),
          },
          orange: {
            saturation: parseFloat(getAttr("OrangeSaturation")),
            luminance: parseFloat(getAttr("OrangeLuminance")),
          },
          yellow: {
            hue: parseFloat(getAttr("YellowHue")),
            saturation: parseFloat(getAttr("YellowSaturation")),
            luminance: parseFloat(getAttr("YellowLuminance")),
          },
          green: {
            hue: parseFloat(getAttr("GreenHue")),
            saturation: parseFloat(getAttr("GreenSaturation")),
          },
          blue: {
            hue: parseFloat(getAttr("BlueHue")),
            saturation: parseFloat(getAttr("BlueSaturation")),
          },
        };

        // Split Toning
        settings.splitToning = {
          shadowHue: parseFloat(getAttr("SplitToningShadowHue")),
          shadowSaturation: parseFloat(getAttr("SplitToningShadowSaturation")),
          highlightHue: parseFloat(getAttr("SplitToningHighlightHue")),
          highlightSaturation: parseFloat(
            getAttr("SplitToningHighlightSaturation")
          ),
          balance: parseFloat(getAttr("SplitToningBalance")),
        };

        // Tone Curve (if present)
        if (settings.toneCurveName === "Custom") {
          settings.toneCurve = {
            rgb: parseToneCurve(getAttr("ToneCurvePV2012")),
            red: parseToneCurve(getAttr("ToneCurvePV2012Red")),
            green: parseToneCurve(getAttr("ToneCurvePV2012Green")),
            blue: parseToneCurve(getAttr("ToneCurvePV2012Blue")),
          };
        }

        setParsedSettings(settings);
        onSettingsParsed(settings);
        setError(null);
      } catch (error) {
        setError("Error processing XMP settings");
        console.error("Error processing XMP:", error);
      }
    };
    reader.readAsText(file);
  };

  const parseToneCurve = (
    curveData: string
  ): Array<{ x: number; y: number }> => {
    if (!curveData) return [];
    return curveData.split(",").map((point) => {
      const [x, y] = point.split(" ").map(Number);
      return { x, y };
    });
  };

  // Helper to format numbers
  const formatSettingValue = (value: any) => {
    if (value === undefined || value === null) return "0";
    const num = Number(value);
    if (isNaN(num)) return "0";
    if (Number.isInteger(num)) return num.toString();
    return num.toFixed(1);
  };

  // Helper to render a slider-like display
  const SettingSliderDisplay = ({
    label,
    value,
  }: {
    label: string;
    value: any;
  }) => (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ my: 1 }}>
      <Typography sx={{ minWidth: 120 }} color="text.secondary">
        {label}
      </Typography>
      <Slider
        value={Number(value)}
        min={-100}
        max={100}
        step={1}
        disabled
        sx={{ width: 180 }}
      />
      <Typography sx={{ minWidth: 32 }}>{formatSettingValue(value)}</Typography>
    </Stack>
  );

  // Helper to render a section
  const renderAccordionSection = (
    title: string,
    keys: string[],
    settings: any,
    content?: React.ReactNode
  ) => {
    const hasValidSettings = keys.some((key) => settings[key] !== undefined);
    if (!hasValidSettings && !content) return null;

    return (
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {content ? (
            content
          ) : (
            <Box>
              {keys.map((key) =>
                settings[key] !== undefined ? (
                  <SettingSliderDisplay
                    key={key}
                    label={key}
                    value={settings[key]}
                  />
                ) : null
              )}
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };

  // Helper to format tone curve data for ToneCurve component
  const formatToneCurveData = (curveData: any) => {
    if (!curveData) return [0, 64, 128, 192, 255];
    const inputPoints = [0, 64, 128, 192, 255];
    return inputPoints.map((input) => {
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
  };

  return (
    <Box>
      <input
        type="file"
        accept=".xmp"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="xmp-file-input"
      />
      <label htmlFor="xmp-file-input">
        <Paper
          sx={{
            p: 3,
            textAlign: "center",
            cursor: "pointer",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <Typography>Click to upload XMP file</Typography>
        </Paper>
      </label>
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      {parsedSettings && Object.keys(parsedSettings).length > 0 && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Parsed Settings Preview
          </Typography>
          <Stack spacing={2}>
            {/* Light Section */}
            {renderAccordionSection(
              "Light",
              [
                "exposure",
                "contrast",
                "highlights",
                "shadows",
                "whites",
                "blacks",
              ],
              parsedSettings
            )}

            {/* Tone Curve Section */}
            {renderAccordionSection(
              "Tone Curve",
              [],
              parsedSettings,
              parsedSettings.toneCurve && (
                <ToneCurve
                  curves={{
                    rgb: formatToneCurveData(
                      Array.isArray(parsedSettings.toneCurve.rgb)
                        ? parsedSettings.toneCurve.rgb
                        : []
                    ),
                    red: formatToneCurveData(
                      Array.isArray(parsedSettings.toneCurve.red)
                        ? parsedSettings.toneCurve.red
                        : []
                    ),
                    green: formatToneCurveData(
                      Array.isArray(parsedSettings.toneCurve.green)
                        ? parsedSettings.toneCurve.green
                        : []
                    ),
                    blue: formatToneCurveData(
                      Array.isArray(parsedSettings.toneCurve.blue)
                        ? parsedSettings.toneCurve.blue
                        : []
                    ),
                  }}
                />
              )
            )}

            {/* Effects Section */}
            {renderAccordionSection(
              "Effects",
              ["texture", "clarity", "dehaze"],
              parsedSettings
            )}

            {/* Grain Section */}
            {parsedSettings.grain &&
              renderAccordionSection(
                "Grain",
                [],
                parsedSettings,
                <Box>
                  <SettingSliderDisplay
                    label="Amount"
                    value={parsedSettings.grain.amount}
                  />
                  <SettingSliderDisplay
                    label="Size"
                    value={parsedSettings.grain.size}
                  />
                  <SettingSliderDisplay
                    label="Frequency"
                    value={parsedSettings.grain.frequency}
                  />
                </Box>
              )}

            {/* Vignette Section */}
            {parsedSettings.vignette &&
              renderAccordionSection(
                "Vignette",
                [],
                parsedSettings,
                <SettingSliderDisplay
                  label="Amount"
                  value={parsedSettings.vignette.amount}
                />
              )}

            {/* Color Adjustments Section */}
            {parsedSettings.colorAdjustments &&
              renderAccordionSection(
                "Color Adjustments",
                [],
                parsedSettings,
                <Box>
                  {Object.entries(parsedSettings.colorAdjustments).map(
                    ([channel, values]: [string, any]) => (
                      <Box key={channel} sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {channel.charAt(0).toUpperCase() + channel.slice(1)}
                        </Typography>
                        {Object.entries(values).map(([k, v]) => (
                          <SettingSliderDisplay key={k} label={k} value={v} />
                        ))}
                      </Box>
                    )
                  )}
                </Box>
              )}

            {/* Split Toning Section */}
            {parsedSettings.splitToning &&
              renderAccordionSection(
                "Split Toning",
                [],
                parsedSettings,
                <Box>
                  <SettingSliderDisplay
                    label="Shadow Hue"
                    value={parsedSettings.splitToning.shadowHue}
                  />
                  <SettingSliderDisplay
                    label="Shadow Saturation"
                    value={parsedSettings.splitToning.shadowSaturation}
                  />
                  <SettingSliderDisplay
                    label="Highlight Hue"
                    value={parsedSettings.splitToning.highlightHue}
                  />
                  <SettingSliderDisplay
                    label="Highlight Saturation"
                    value={parsedSettings.splitToning.highlightSaturation}
                  />
                  <SettingSliderDisplay
                    label="Balance"
                    value={parsedSettings.splitToning.balance}
                  />
                </Box>
              )}
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

export default XmpParser;
