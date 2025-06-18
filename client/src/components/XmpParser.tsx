import React, { useState } from "react";
import { Box, Typography, Paper } from "@mui/material";

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
  temp?: number;
  tint?: number;
  vibrance?: number;
  saturation?: number;
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

        // Color settings
        settings.temp = parseFloat(getAttr("Temperature"));
        settings.tint = parseFloat(getAttr("Tint"));
        settings.vibrance = parseFloat(getAttr("Vibrance"));
        settings.saturation = parseFloat(getAttr("Saturation"));

        // Effects
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
      {parsedSettings && (
        <Typography color="success.main" sx={{ mt: 2 }}>
          ✓ XMP file parsed successfully
        </Typography>
      )}
    </Box>
  );
};

export default XmpParser;
