import React, { useState } from "react";
import { Box, Typography, Paper } from "@mui/material";

export interface ParsedSettings {
  // Camera & Profile Metadata
  version?: string;
  processVersion?: string;
  cameraProfile?: string;
  cameraProfileDigest?: string;
  profileName?: string;
  lookTableName?: string;
  whiteBalance?: string;

  // Basic Adjustments
  exposure?: number;
  contrast?: number;
  highlights?: number;
  shadows?: number;
  whites?: number;
  blacks?: number;
  clarity?: number;
  dehaze?: number;
  texture?: number;
  vibrance?: number;
  saturation?: number;
  temp?: number;
  tint?: number;

  // Tone Curve
  toneCurveName?: string;
  toneCurve?: {
    rgb: Array<{ x: number; y: number }>;
    red: Array<{ x: number; y: number }>;
    green: Array<{ x: number; y: number }>;
    blue: Array<{ x: number; y: number }>;
  };

  // Color Adjustments – HSL/Color
  colorAdjustments?: {
    red?: {
      hue: number;
      saturation: number;
      luminance: number;
    };
    orange?: {
      hue: number;
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
      luminance: number;
    };
    aqua?: {
      hue: number;
      saturation: number;
      luminance: number;
    };
    blue?: {
      hue: number;
      saturation: number;
      luminance: number;
    };
    purple?: {
      hue: number;
      saturation: number;
      luminance: number;
    };
    magenta?: {
      hue: number;
      saturation: number;
      luminance: number;
    };
  };

  // Color Grading (Split Toning)
  splitToning?: {
    shadowHue: number;
    shadowSaturation: number;
    highlightHue: number;
    highlightSaturation: number;
    balance: number;
  };

  // Color Grading (new format)
  colorGrading?: {
    shadowHue: number;
    shadowSat: number;
    midtoneHue: number;
    midtoneSat: number;
    highlightHue: number;
    highlightSat: number;
    blending: number;
    globalHue: number;
    globalSat: number;
    perceptual: boolean;
  };

  // Detail (Sharpening & Noise)
  detail?: {
    sharpness: number;
    sharpenRadius: number;
    sharpenDetail: number;
    sharpenEdgeMasking: number;
    luminanceSmoothing: number;
    luminanceDetail: number;
    luminanceContrast: number;
    colorNoiseReduction: number;
    colorNoiseReductionDetail: number;
    colorNoiseReductionSmoothness: number;
  };

  // Lens Corrections
  lensCorrections?: {
    enableLensProfileCorrections: boolean;
    lensProfileName: string;
    lensManualDistortionAmount: number;
    perspectiveUpright: string;
    autoLateralCA: boolean;
  };

  // Optics – Chromatic Aberration & Vignette
  optics?: {
    removeChromaticAberration: boolean;
    vignetteAmount: number;
    vignetteMidpoint: number;
  };

  // Transform (Geometry)
  transform?: {
    perspectiveVertical: number;
    perspectiveHorizontal: number;
    perspectiveRotate: number;
    perspectiveScale: number;
    perspectiveAspect: number;
    autoPerspective: boolean;
  };

  // Effects
  effects?: {
    postCropVignetteAmount: number;
    postCropVignetteMidpoint: number;
    postCropVignetteFeather: number;
    postCropVignetteRoundness: number;
    postCropVignetteStyle: string;
    grainAmount: number;
    grainSize: number;
    grainFrequency: number;
  };

  // Calibration
  calibration?: {
    cameraCalibrationBluePrimaryHue: number;
    cameraCalibrationBluePrimarySaturation: number;
    cameraCalibrationGreenPrimaryHue: number;
    cameraCalibrationGreenPrimarySaturation: number;
    cameraCalibrationRedPrimaryHue: number;
    cameraCalibrationRedPrimarySaturation: number;
    cameraCalibrationShadowTint: number;
    cameraCalibrationVersion: string;
  };

  // Cropping & Orientation
  crop?: {
    cropTop: number;
    cropLeft: number;
    cropBottom: number;
    cropRight: number;
    cropAngle: number;
    cropConstrainToWarp: boolean;
  };
  orientation?: string;

  // Metadata
  metadata?: {
    rating: number;
    label: string;
    title: string;
    creator: string;
    dateCreated: string;
  };

  // Other
  hasSettings?: boolean;
  rawFileName?: string;
  snapshot?: string;
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

        // Helper function to get boolean attribute
        const getBoolAttr = (name: string): boolean => {
          return description.getAttribute(`crs:${name}`) === "True";
        };

        // Camera & Profile Metadata
        settings.version = getAttr("Version");
        settings.processVersion = getAttr("ProcessVersion");
        settings.cameraProfile = getAttr("CameraProfile");
        settings.cameraProfileDigest = getAttr("CameraProfileDigest");
        settings.profileName = getAttr("ProfileName");
        settings.lookTableName = getAttr("LookTableName");
        settings.whiteBalance = getAttr("WhiteBalance");

        // Basic Adjustments
        settings.exposure = parseFloat(getAttr("Exposure2012"));
        settings.contrast = parseFloat(getAttr("Contrast2012"));
        settings.highlights = parseFloat(getAttr("Highlights2012"));
        settings.shadows = parseFloat(getAttr("Shadows2012"));
        settings.whites = parseFloat(getAttr("Whites2012"));
        settings.blacks = parseFloat(getAttr("Blacks2012"));
        settings.clarity = parseFloat(getAttr("Clarity2012"));
        settings.dehaze = parseFloat(getAttr("Dehaze"));
        settings.texture = parseFloat(getAttr("Texture"));
        settings.vibrance = parseFloat(getAttr("Vibrance"));
        settings.saturation = parseFloat(getAttr("Saturation"));
        settings.temp = parseFloat(getAttr("Temperature"));
        settings.tint = parseFloat(getAttr("Tint"));

        // Tone Curve
        settings.toneCurveName = getAttr("ToneCurveName2012");
        if (settings.toneCurveName === "Custom") {
          settings.toneCurve = {
            rgb: parseToneCurve(getAttr("ToneCurvePV2012")),
            red: parseToneCurve(getAttr("ToneCurvePV2012Red")),
            green: parseToneCurve(getAttr("ToneCurvePV2012Green")),
            blue: parseToneCurve(getAttr("ToneCurvePV2012Blue")),
          };
        }

        // Color Adjustments – HSL/Color
        settings.colorAdjustments = {
          red: {
            hue: parseFloat(getAttr("HueAdjustmentRed")),
            saturation: parseFloat(getAttr("SaturationAdjustmentRed")),
            luminance: parseFloat(getAttr("LuminanceAdjustmentRed")),
          },
          orange: {
            hue: parseFloat(getAttr("HueAdjustmentOrange")),
            saturation: parseFloat(getAttr("SaturationAdjustmentOrange")),
            luminance: parseFloat(getAttr("LuminanceAdjustmentOrange")),
          },
          yellow: {
            hue: parseFloat(getAttr("HueAdjustmentYellow")),
            saturation: parseFloat(getAttr("SaturationAdjustmentYellow")),
            luminance: parseFloat(getAttr("LuminanceAdjustmentYellow")),
          },
          green: {
            hue: parseFloat(getAttr("HueAdjustmentGreen")),
            saturation: parseFloat(getAttr("SaturationAdjustmentGreen")),
            luminance: parseFloat(getAttr("LuminanceAdjustmentGreen")),
          },
          aqua: {
            hue: parseFloat(getAttr("HueAdjustmentAqua")),
            saturation: parseFloat(getAttr("SaturationAdjustmentAqua")),
            luminance: parseFloat(getAttr("LuminanceAdjustmentAqua")),
          },
          blue: {
            hue: parseFloat(getAttr("HueAdjustmentBlue")),
            saturation: parseFloat(getAttr("SaturationAdjustmentBlue")),
            luminance: parseFloat(getAttr("LuminanceAdjustmentBlue")),
          },
          purple: {
            hue: parseFloat(getAttr("HueAdjustmentPurple")),
            saturation: parseFloat(getAttr("SaturationAdjustmentPurple")),
            luminance: parseFloat(getAttr("LuminanceAdjustmentPurple")),
          },
          magenta: {
            hue: parseFloat(getAttr("HueAdjustmentMagenta")),
            saturation: parseFloat(getAttr("SaturationAdjustmentMagenta")),
            luminance: parseFloat(getAttr("LuminanceAdjustmentMagenta")),
          },
        };

        // Split Toning (legacy)
        settings.splitToning = {
          shadowHue: parseFloat(getAttr("SplitToningShadowHue")),
          shadowSaturation: parseFloat(getAttr("SplitToningShadowSaturation")),
          highlightHue: parseFloat(getAttr("SplitToningHighlightHue")),
          highlightSaturation: parseFloat(
            getAttr("SplitToningHighlightSaturation")
          ),
          balance: parseFloat(getAttr("SplitToningBalance")),
        };

        // Color Grading (new format)
        settings.colorGrading = {
          shadowHue: parseFloat(getAttr("ColorGradeShadowHue")),
          shadowSat: parseFloat(getAttr("ColorGradeShadowSat")),
          midtoneHue: parseFloat(getAttr("ColorGradeMidtoneHue")),
          midtoneSat: parseFloat(getAttr("ColorGradeMidtoneSat")),
          highlightHue: parseFloat(getAttr("ColorGradeHighlightHue")),
          highlightSat: parseFloat(getAttr("ColorGradeHighlightSat")),
          blending: parseFloat(getAttr("ColorGradeBlending")),
          globalHue: parseFloat(getAttr("ColorGradeGlobalHue")),
          globalSat: parseFloat(getAttr("ColorGradeGlobalSat")),
          perceptual: getBoolAttr("ColorGradePerceptual"),
        };

        // Detail (Sharpening & Noise)
        settings.detail = {
          sharpness: parseFloat(getAttr("Sharpness")),
          sharpenRadius: parseFloat(getAttr("SharpenRadius")),
          sharpenDetail: parseFloat(getAttr("SharpenDetail")),
          sharpenEdgeMasking: parseFloat(getAttr("SharpenEdgeMasking")),
          luminanceSmoothing: parseFloat(getAttr("LuminanceSmoothing")),
          luminanceDetail: parseFloat(getAttr("LuminanceDetail")),
          luminanceContrast: parseFloat(getAttr("LuminanceContrast")),
          colorNoiseReduction: parseFloat(getAttr("ColorNoiseReduction")),
          colorNoiseReductionDetail: parseFloat(
            getAttr("ColorNoiseReductionDetail")
          ),
          colorNoiseReductionSmoothness: parseFloat(
            getAttr("ColorNoiseReductionSmoothness")
          ),
        };

        // Lens Corrections
        settings.lensCorrections = {
          enableLensProfileCorrections: getBoolAttr(
            "EnableLensProfileCorrections"
          ),
          lensProfileName: getAttr("LensProfileName"),
          lensManualDistortionAmount: parseFloat(
            getAttr("LensManualDistortionAmount")
          ),
          perspectiveUpright: getAttr("PerspectiveUpright"),
          autoLateralCA: getBoolAttr("AutoLateralCA"),
        };

        // Optics – Chromatic Aberration & Vignette
        settings.optics = {
          removeChromaticAberration: getBoolAttr("RemoveChromaticAberration"),
          vignetteAmount: parseFloat(getAttr("VignetteAmount")),
          vignetteMidpoint: parseFloat(getAttr("VignetteMidpoint")),
        };

        // Transform (Geometry)
        settings.transform = {
          perspectiveVertical: parseFloat(getAttr("PerspectiveVertical")),
          perspectiveHorizontal: parseFloat(getAttr("PerspectiveHorizontal")),
          perspectiveRotate: parseFloat(getAttr("PerspectiveRotate")),
          perspectiveScale: parseFloat(getAttr("PerspectiveScale")),
          perspectiveAspect: parseFloat(getAttr("PerspectiveAspect")),
          autoPerspective: getBoolAttr("AutoPerspective"),
        };

        // Effects
        settings.effects = {
          postCropVignetteAmount: parseFloat(getAttr("PostCropVignetteAmount")),
          postCropVignetteMidpoint: parseFloat(
            getAttr("PostCropVignetteMidpoint")
          ),
          postCropVignetteFeather: parseFloat(
            getAttr("PostCropVignetteFeather")
          ),
          postCropVignetteRoundness: parseFloat(
            getAttr("PostCropVignetteRoundness")
          ),
          postCropVignetteStyle: getAttr("PostCropVignetteStyle"),
          grainAmount: parseFloat(getAttr("GrainAmount")),
          grainSize: parseFloat(getAttr("GrainSize")),
          grainFrequency: parseFloat(getAttr("GrainFrequency")),
        };

        // Calibration
        settings.calibration = {
          cameraCalibrationBluePrimaryHue: parseFloat(
            getAttr("CameraCalibrationBluePrimaryHue")
          ),
          cameraCalibrationBluePrimarySaturation: parseFloat(
            getAttr("CameraCalibrationBluePrimarySaturation")
          ),
          cameraCalibrationGreenPrimaryHue: parseFloat(
            getAttr("CameraCalibrationGreenPrimaryHue")
          ),
          cameraCalibrationGreenPrimarySaturation: parseFloat(
            getAttr("CameraCalibrationGreenPrimarySaturation")
          ),
          cameraCalibrationRedPrimaryHue: parseFloat(
            getAttr("CameraCalibrationRedPrimaryHue")
          ),
          cameraCalibrationRedPrimarySaturation: parseFloat(
            getAttr("CameraCalibrationRedPrimarySaturation")
          ),
          cameraCalibrationShadowTint: parseFloat(
            getAttr("CameraCalibrationShadowTint")
          ),
          cameraCalibrationVersion: getAttr("CameraCalibrationVersion"),
        };

        // Cropping & Orientation
        settings.crop = {
          cropTop: parseFloat(getAttr("CropTop")),
          cropLeft: parseFloat(getAttr("CropLeft")),
          cropBottom: parseFloat(getAttr("CropBottom")),
          cropRight: parseFloat(getAttr("CropRight")),
          cropAngle: parseFloat(getAttr("CropAngle")),
          cropConstrainToWarp: getBoolAttr("CropConstrainToWarp"),
        };
        settings.orientation = getAttr("Orientation");

        // Metadata
        settings.metadata = {
          rating: parseFloat(getAttr("Rating")),
          label: getAttr("Label"),
          title: getAttr("Title"),
          creator: getAttr("Creator"),
          dateCreated: getAttr("DateCreated"),
        };

        // Other
        settings.hasSettings = getBoolAttr("HasSettings");
        settings.rawFileName = getAttr("RawFileName");
        settings.snapshot = getAttr("Snapshot");

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
