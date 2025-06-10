import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

interface XmpSettings {
  // Light settings
  exposure: number;
  contrast: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;

  // Color settings
  temp: number;
  tint: number;
  vibrance: number;
  saturation: number;

  // Effects
  clarity: number;
  dehaze: number;
  grain: {
    amount: number;
    size: number;
    roughness: number;
  };

  // Detail
  sharpening: number;
  noiseReduction: {
    luminance: number;
    detail: number;
    color: number;
  };

  // Tone curves
  toneCurve: {
    rgb: Array<{ x: number; y: number }>;
    red: Array<{ x: number; y: number }>;
    green: Array<{ x: number; y: number }>;
    blue: Array<{ x: number; y: number }>;
  };
}

interface XmpParserProps {
  onSettingsParsed: (settings: XmpSettings) => void;
}

const XmpParser: React.FC<XmpParserProps> = ({ onSettingsParsed }) => {
  const [error, setError] = useState<string | null>(null);

  const parseToneCurve = (
    curveData: string
  ): Array<{ x: number; y: number }> => {
    try {
      // Remove any non-numeric characters except commas and spaces
      const cleanData = curveData.replace(/[^0-9,.\s]/g, "");
      const points = cleanData.split(",").map(Number);
      const curvePoints = [];

      for (let i = 0; i < points.length; i += 2) {
        if (!isNaN(points[i]) && !isNaN(points[i + 1])) {
          curvePoints.push({
            x: points[i],
            y: points[i + 1],
          });
        }
      }

      return curvePoints;
    } catch (error) {
      console.error("Error parsing tone curve:", error);
      return [];
    }
  };

  const parseXmpFile = async (file: File) => {
    try {
      const text = await file.text();
      setError(null);

      // Extract settings using regex patterns
      const settings: XmpSettings = {
        // Light settings
        exposure: parseFloat(text.match(/crs:Exposure="([^"]+)"/)?.[1] || "0"),
        contrast: parseFloat(text.match(/crs:Contrast="([^"]+)"/)?.[1] || "0"),
        highlights: parseFloat(
          text.match(/crs:Highlights="([^"]+)"/)?.[1] || "0"
        ),
        shadows: parseFloat(text.match(/crs:Shadows="([^"]+)"/)?.[1] || "0"),
        whites: parseFloat(text.match(/crs:Whites="([^"]+)"/)?.[1] || "0"),
        blacks: parseFloat(text.match(/crs:Blacks="([^"]+)"/)?.[1] || "0"),

        // Color settings
        temp: parseFloat(text.match(/crs:Temperature="([^"]+)"/)?.[1] || "0"),
        tint: parseFloat(text.match(/crs:Tint="([^"]+)"/)?.[1] || "0"),
        vibrance: parseFloat(text.match(/crs:Vibrance="([^"]+)"/)?.[1] || "0"),
        saturation: parseFloat(
          text.match(/crs:Saturation="([^"]+)"/)?.[1] || "0"
        ),

        // Effects
        clarity: parseFloat(text.match(/crs:Clarity="([^"]+)"/)?.[1] || "0"),
        dehaze: parseFloat(text.match(/crs:Dehaze="([^"]+)"/)?.[1] || "0"),
        grain: {
          amount: parseFloat(
            text.match(/crs:GrainAmount="([^"]+)"/)?.[1] || "0"
          ),
          size: parseFloat(text.match(/crs:GrainSize="([^"]+)"/)?.[1] || "0"),
          roughness: parseFloat(
            text.match(/crs:GrainRoughness="([^"]+)"/)?.[1] || "0"
          ),
        },

        // Detail
        sharpening: parseFloat(
          text.match(/crs:Sharpness="([^"]+)"/)?.[1] || "0"
        ),
        noiseReduction: {
          luminance: parseFloat(
            text.match(/crs:LuminanceSmoothing="([^"]+)"/)?.[1] || "0"
          ),
          detail: parseFloat(
            text.match(/crs:LuminanceDetail="([^"]+)"/)?.[1] || "0"
          ),
          color: parseFloat(
            text.match(/crs:ColorNoiseReduction="([^"]+)"/)?.[1] || "0"
          ),
        },

        // Tone curves
        toneCurve: {
          rgb: parseToneCurve(text.match(/crs:ToneCurve="([^"]+)"/)?.[1] || ""),
          red: parseToneCurve(
            text.match(/crs:ToneCurveRed="([^"]+)"/)?.[1] || ""
          ),
          green: parseToneCurve(
            text.match(/crs:ToneCurveGreen="([^"]+)"/)?.[1] || ""
          ),
          blue: parseToneCurve(
            text.match(/crs:ToneCurveBlue="([^"]+)"/)?.[1] || ""
          ),
        },
      };

      onSettingsParsed(settings);
    } catch (error) {
      console.error("Error parsing XMP file:", error);
      setError(
        "Failed to parse XMP file. Please make sure it's a valid preset file."
      );
    }
  };

  return (
    <Box>
      <Button
        component="label"
        variant="outlined"
        startIcon={<CloudUpload />}
        sx={{ mt: 1 }}
      >
        Upload .xmp File
        <input
          type="file"
          accept=".xmp"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) parseXmpFile(file);
          }}
        />
      </Button>
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default XmpParser;
