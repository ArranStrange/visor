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
    shadowLuminance: number;
    midtoneHue: number;
    midtoneSat: number;
    midtoneLuminance: number;
    highlightHue: number;
    highlightSat: number;
    highlightLuminance: number;
    blending: number;
    balance: number;
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

  // Settings (mapped to match PresetDetails structure)
  settings?: {
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
    sharpening?: number;
    sharpenRadius?: number;
    sharpenDetail?: number;
    sharpenEdgeMasking?: number;
    luminanceSmoothing?: number;
    luminanceDetail?: number;
    luminanceContrast?: number;
    noiseReduction?: {
      luminance?: number;
      detail?: number;
      color?: number;
      smoothness?: number;
    };
    grain?: {
      amount?: number;
      size?: number;
      roughness?: number;
    };
    colorAdjustments?: {
      red?: { hue: number; saturation: number; luminance: number };
      orange?: { hue: number; saturation: number; luminance: number };
      yellow?: { hue: number; saturation: number; luminance: number };
      green?: { hue: number; saturation: number; luminance: number };
      aqua?: { hue: number; saturation: number; luminance: number };
      blue?: { hue: number; saturation: number; luminance: number };
      purple?: { hue: number; saturation: number; luminance: number };
      magenta?: { hue: number; saturation: number; luminance: number };
    };
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

        // Helper function to convert XMP value to database format (multiply by 100)
        const convertToDatabaseValue = (value: string): number => {
          const num = parseFloat(value);
          return isNaN(num) ? 0 : Math.round(num * 100);
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
        settings.exposure = convertToDatabaseValue(getAttr("Exposure2012"));
        settings.contrast = convertToDatabaseValue(getAttr("Contrast2012"));
        settings.highlights = convertToDatabaseValue(getAttr("Highlights2012"));
        settings.shadows = convertToDatabaseValue(getAttr("Shadows2012"));
        settings.whites = convertToDatabaseValue(getAttr("Whites2012"));
        settings.blacks = convertToDatabaseValue(getAttr("Blacks2012"));
        settings.clarity = convertToDatabaseValue(getAttr("Clarity2012"));
        settings.dehaze = convertToDatabaseValue(getAttr("Dehaze"));
        settings.texture = convertToDatabaseValue(getAttr("Texture"));
        settings.vibrance = convertToDatabaseValue(getAttr("Vibrance"));
        settings.saturation = convertToDatabaseValue(getAttr("Saturation"));
        settings.temp = convertToDatabaseValue(getAttr("Temperature"));
        settings.tint = convertToDatabaseValue(getAttr("Tint"));

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
            hue: convertToDatabaseValue(getAttr("HueAdjustmentRed")),
            saturation: convertToDatabaseValue(
              getAttr("SaturationAdjustmentRed")
            ),
            luminance: convertToDatabaseValue(
              getAttr("LuminanceAdjustmentRed")
            ),
          },
          orange: {
            hue: convertToDatabaseValue(getAttr("HueAdjustmentOrange")),
            saturation: convertToDatabaseValue(
              getAttr("SaturationAdjustmentOrange")
            ),
            luminance: convertToDatabaseValue(
              getAttr("LuminanceAdjustmentOrange")
            ),
          },
          yellow: {
            hue: convertToDatabaseValue(getAttr("HueAdjustmentYellow")),
            saturation: convertToDatabaseValue(
              getAttr("SaturationAdjustmentYellow")
            ),
            luminance: convertToDatabaseValue(
              getAttr("LuminanceAdjustmentYellow")
            ),
          },
          green: {
            hue: convertToDatabaseValue(getAttr("HueAdjustmentGreen")),
            saturation: convertToDatabaseValue(
              getAttr("SaturationAdjustmentGreen")
            ),
            luminance: convertToDatabaseValue(
              getAttr("LuminanceAdjustmentGreen")
            ),
          },
          aqua: {
            hue: convertToDatabaseValue(getAttr("HueAdjustmentAqua")),
            saturation: convertToDatabaseValue(
              getAttr("SaturationAdjustmentAqua")
            ),
            luminance: convertToDatabaseValue(
              getAttr("LuminanceAdjustmentAqua")
            ),
          },
          blue: {
            hue: convertToDatabaseValue(getAttr("HueAdjustmentBlue")),
            saturation: convertToDatabaseValue(
              getAttr("SaturationAdjustmentBlue")
            ),
            luminance: convertToDatabaseValue(
              getAttr("LuminanceAdjustmentBlue")
            ),
          },
          purple: {
            hue: convertToDatabaseValue(getAttr("HueAdjustmentPurple")),
            saturation: convertToDatabaseValue(
              getAttr("SaturationAdjustmentPurple")
            ),
            luminance: convertToDatabaseValue(
              getAttr("LuminanceAdjustmentPurple")
            ),
          },
          magenta: {
            hue: convertToDatabaseValue(getAttr("HueAdjustmentMagenta")),
            saturation: convertToDatabaseValue(
              getAttr("SaturationAdjustmentMagenta")
            ),
            luminance: convertToDatabaseValue(
              getAttr("LuminanceAdjustmentMagenta")
            ),
          },
        };

        // Split Toning (legacy)
        settings.splitToning = {
          shadowHue: convertToDatabaseValue(getAttr("SplitToningShadowHue")),
          shadowSaturation: convertToDatabaseValue(
            getAttr("SplitToningShadowSaturation")
          ),
          highlightHue: convertToDatabaseValue(
            getAttr("SplitToningHighlightHue")
          ),
          highlightSaturation: convertToDatabaseValue(
            getAttr("SplitToningHighlightSaturation")
          ),
          balance: convertToDatabaseValue(getAttr("SplitToningBalance")),
        };

        // Color Grading (new format)
        settings.colorGrading = {
          shadowHue: convertToDatabaseValue(getAttr("ColorGradeShadowHue")),
          shadowSat: convertToDatabaseValue(getAttr("ColorGradeShadowSat")),
          shadowLuminance: convertToDatabaseValue(
            getAttr("ColorGradeShadowLuminance") || "0"
          ),
          midtoneHue: convertToDatabaseValue(getAttr("ColorGradeMidtoneHue")),
          midtoneSat: convertToDatabaseValue(getAttr("ColorGradeMidtoneSat")),
          midtoneLuminance: convertToDatabaseValue(
            getAttr("ColorGradeMidtoneLuminance") || "0"
          ),
          highlightHue: convertToDatabaseValue(
            getAttr("ColorGradeHighlightHue")
          ),
          highlightSat: convertToDatabaseValue(
            getAttr("ColorGradeHighlightSat")
          ),
          highlightLuminance: convertToDatabaseValue(
            getAttr("ColorGradeHighlightLuminance") || "0"
          ),
          blending: convertToDatabaseValue(getAttr("ColorGradeBlending")),
          balance: convertToDatabaseValue(getAttr("ColorGradeBalance") || "0"),
          globalHue: convertToDatabaseValue(getAttr("ColorGradeGlobalHue")),
          globalSat: convertToDatabaseValue(getAttr("ColorGradeGlobalSat")),
          perceptual: getBoolAttr("ColorGradePerceptual"),
        };

        // Detail (Sharpening & Noise)
        settings.detail = {
          sharpness: convertToDatabaseValue(getAttr("Sharpness")),
          sharpenRadius: convertToDatabaseValue(getAttr("SharpenRadius")),
          sharpenDetail: convertToDatabaseValue(getAttr("SharpenDetail")),
          sharpenEdgeMasking: convertToDatabaseValue(
            getAttr("SharpenEdgeMasking")
          ),
          luminanceSmoothing: convertToDatabaseValue(
            getAttr("LuminanceSmoothing")
          ),
          luminanceDetail: convertToDatabaseValue(getAttr("LuminanceDetail")),
          luminanceContrast: convertToDatabaseValue(
            getAttr("LuminanceContrast")
          ),
          colorNoiseReduction: convertToDatabaseValue(
            getAttr("ColorNoiseReduction")
          ),
          colorNoiseReductionDetail: convertToDatabaseValue(
            getAttr("ColorNoiseReductionDetail")
          ),
          colorNoiseReductionSmoothness: convertToDatabaseValue(
            getAttr("ColorNoiseReductionSmoothness")
          ),
        };

        // Create settings object that matches PresetDetails structure
        settings.settings = {
          exposure: settings.exposure,
          contrast: settings.contrast,
          highlights: settings.highlights,
          shadows: settings.shadows,
          whites: settings.whites,
          blacks: settings.blacks,
          clarity: settings.clarity,
          dehaze: settings.dehaze,
          texture: settings.texture,
          vibrance: settings.vibrance,
          saturation: settings.saturation,
          temp: settings.temp,
          tint: settings.tint,
          sharpening: settings.detail?.sharpness,
          sharpenRadius: settings.detail?.sharpenRadius,
          sharpenDetail: settings.detail?.sharpenDetail,
          sharpenEdgeMasking: settings.detail?.sharpenEdgeMasking,
          luminanceSmoothing: settings.detail?.luminanceSmoothing,
          luminanceDetail: settings.detail?.luminanceDetail,
          luminanceContrast: settings.detail?.luminanceContrast,
          noiseReduction: {
            luminance: settings.detail?.luminanceSmoothing,
            detail: settings.detail?.luminanceDetail,
            color: settings.detail?.colorNoiseReduction,
            smoothness: settings.detail?.colorNoiseReductionSmoothness,
          },
          grain: {
            amount: settings.effects?.grainAmount,
            size: settings.effects?.grainSize,
            roughness: settings.effects?.grainFrequency,
          },
          colorAdjustments: settings.colorAdjustments,
        };

        // Lens Corrections
        settings.lensCorrections = {
          enableLensProfileCorrections: getBoolAttr(
            "EnableLensProfileCorrections"
          ),
          lensProfileName: getAttr("LensProfileName"),
          lensManualDistortionAmount: convertToDatabaseValue(
            getAttr("LensManualDistortionAmount")
          ),
          perspectiveUpright: getAttr("PerspectiveUpright"),
          autoLateralCA: getBoolAttr("AutoLateralCA"),
        };

        // Optics – Chromatic Aberration & Vignette
        settings.optics = {
          removeChromaticAberration: getBoolAttr("RemoveChromaticAberration"),
          vignetteAmount: convertToDatabaseValue(getAttr("VignetteAmount")),
          vignetteMidpoint: convertToDatabaseValue(getAttr("VignetteMidpoint")),
        };

        // Transform (Geometry)
        settings.transform = {
          perspectiveVertical: convertToDatabaseValue(
            getAttr("PerspectiveVertical")
          ),
          perspectiveHorizontal: convertToDatabaseValue(
            getAttr("PerspectiveHorizontal")
          ),
          perspectiveRotate: convertToDatabaseValue(
            getAttr("PerspectiveRotate")
          ),
          perspectiveScale: convertToDatabaseValue(getAttr("PerspectiveScale")),
          perspectiveAspect: convertToDatabaseValue(
            getAttr("PerspectiveAspect")
          ),
          autoPerspective: getBoolAttr("AutoPerspective"),
        };

        // Effects
        settings.effects = {
          postCropVignetteAmount: convertToDatabaseValue(
            getAttr("PostCropVignetteAmount")
          ),
          postCropVignetteMidpoint: convertToDatabaseValue(
            getAttr("PostCropVignetteMidpoint")
          ),
          postCropVignetteFeather: convertToDatabaseValue(
            getAttr("PostCropVignetteFeather")
          ),
          postCropVignetteRoundness: convertToDatabaseValue(
            getAttr("PostCropVignetteRoundness")
          ),
          postCropVignetteStyle: getAttr("PostCropVignetteStyle"),
          grainAmount: convertToDatabaseValue(getAttr("GrainAmount")),
          grainSize: convertToDatabaseValue(getAttr("GrainSize")),
          grainFrequency: convertToDatabaseValue(getAttr("GrainFrequency")),
        };

        // Calibration
        settings.calibration = {
          cameraCalibrationBluePrimaryHue: convertToDatabaseValue(
            getAttr("CameraCalibrationBluePrimaryHue")
          ),
          cameraCalibrationBluePrimarySaturation: convertToDatabaseValue(
            getAttr("CameraCalibrationBluePrimarySaturation")
          ),
          cameraCalibrationGreenPrimaryHue: convertToDatabaseValue(
            getAttr("CameraCalibrationGreenPrimaryHue")
          ),
          cameraCalibrationGreenPrimarySaturation: convertToDatabaseValue(
            getAttr("CameraCalibrationGreenPrimarySaturation")
          ),
          cameraCalibrationRedPrimaryHue: convertToDatabaseValue(
            getAttr("CameraCalibrationRedPrimaryHue")
          ),
          cameraCalibrationRedPrimarySaturation: convertToDatabaseValue(
            getAttr("CameraCalibrationRedPrimarySaturation")
          ),
          cameraCalibrationShadowTint: convertToDatabaseValue(
            getAttr("CameraCalibrationShadowTint")
          ),
          cameraCalibrationVersion: getAttr("CameraCalibrationVersion"),
        };

        // Cropping & Orientation
        settings.crop = {
          cropTop: convertToDatabaseValue(getAttr("CropTop")),
          cropLeft: convertToDatabaseValue(getAttr("CropLeft")),
          cropBottom: convertToDatabaseValue(getAttr("CropBottom")),
          cropRight: convertToDatabaseValue(getAttr("CropRight")),
          cropAngle: convertToDatabaseValue(getAttr("CropAngle")),
          cropConstrainToWarp: getBoolAttr("CropConstrainToWarp"),
        };
        settings.orientation = getAttr("Orientation");

        // Metadata
        settings.metadata = {
          rating: convertToDatabaseValue(getAttr("Rating")),
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
