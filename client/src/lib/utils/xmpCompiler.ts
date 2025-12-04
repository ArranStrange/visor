export interface PresetSettings {
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
  clarity?: number;
  dehaze?: number;
  texture?: number;
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
    colorSmoothness?: number;
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
}

export interface ToneCurvePoint {
  x: number;
  y: number;
}

export interface ToneCurve {
  rgb?: ToneCurvePoint[];
  red?: ToneCurvePoint[];
  green?: ToneCurvePoint[];
  blue?: ToneCurvePoint[];
}

export interface PresetData {
  title: string;
  description?: string;
  settings: PresetSettings;
  toneCurve?: ToneCurve;
  whiteBalance?: string;
  cameraProfile?: string;
  profileName?: string;
  version?: string;
  processVersion?: string;
  creator?: string;
  dateCreated?: string;
}

// Helper function to convert tone curve array to XMP format
const formatToneCurve = (curve: ToneCurvePoint[]): string => {
  if (!curve || curve.length === 0) return "";

  return curve.map((point) => `${point.x} ${point.y}`).join(", ");
};

// Helper function to convert number to string with proper precision
const formatNumber = (value: number | undefined): string => {
  if (value === undefined || value === null) return "0";
  return value.toString();
};

// Helper function to convert boolean to XMP format
const formatBoolean = (value: boolean | undefined): string => {
  return value ? "True" : "False";
};

export const compileXMP = (preset: PresetData): string => {
  const settings = preset.settings;
  const toneCurve = preset.toneCurve;

  // Convert database values to XMP format (multiply by 100 for percentage values)
  const convertToXMPValue = (value: number | undefined): string => {
    if (value === undefined || value === null) return "0";
    // Convert from database format (0-100) to XMP format (0-100)
    return (value / 100).toString();
  };

  const xmpTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 9.1.0">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
      xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"
      crs:Version="${preset.version || "15.0"}"
      crs:ProcessVersion="${preset.processVersion || "15.0"}"
      crs:WhiteBalance="${preset.whiteBalance || "Custom"}"
      crs:Temperature="${formatNumber(settings.temp)}"
      crs:Tint="${formatNumber(settings.tint)}"
      crs:Exposure2012="${convertToXMPValue(settings.exposure)}"
      crs:Contrast2012="${convertToXMPValue(settings.contrast)}"
      crs:Highlights2012="${convertToXMPValue(settings.highlights)}"
      crs:Shadows2012="${convertToXMPValue(settings.shadows)}"
      crs:Whites2012="${convertToXMPValue(settings.whites)}"
      crs:Blacks2012="${convertToXMPValue(settings.blacks)}"
      crs:Clarity2012="${convertToXMPValue(settings.clarity)}"
      crs:Dehaze="${convertToXMPValue(settings.dehaze)}"
      crs:Texture="${convertToXMPValue(settings.texture)}"
      crs:Vibrance="${convertToXMPValue(settings.vibrance)}"
      crs:Saturation="${convertToXMPValue(settings.saturation)}"
      crs:Sharpness="${convertToXMPValue(settings.sharpening)}"
      crs:SharpenRadius="${convertToXMPValue(settings.sharpenRadius)}"
      crs:SharpenDetail="${convertToXMPValue(settings.sharpenDetail)}"
      crs:SharpenEdgeMasking="${convertToXMPValue(settings.sharpenEdgeMasking)}"
      crs:LuminanceSmoothing="${convertToXMPValue(settings.luminanceSmoothing)}"
      crs:LuminanceDetail="${convertToXMPValue(settings.luminanceDetail)}"
      crs:LuminanceContrast="${convertToXMPValue(settings.luminanceContrast)}"
      crs:ColorNoiseReduction="${convertToXMPValue(
        settings.noiseReduction?.color
      )}"
      crs:ColorNoiseReductionDetail="${convertToXMPValue(
        settings.noiseReduction?.detail
      )}"
      crs:ColorNoiseReductionSmoothness="${convertToXMPValue(
        settings.noiseReduction?.colorSmoothness
      )}"
      crs:GrainAmount="${convertToXMPValue(settings.grain?.amount)}"
      crs:GrainSize="${convertToXMPValue(settings.grain?.size)}"
      crs:GrainFrequency="${convertToXMPValue(settings.grain?.roughness)}"
      crs:CameraProfile="${preset.cameraProfile || "Adobe Standard"}"
      crs:ProfileName="${preset.profileName || "Adobe Standard"}"
      crs:HasSettings="True"
      crs:RawFileName=""
      crs:Snapshot=""
      crs:Creator="${preset.creator || "VISOR"}"
      crs:DateCreated="${preset.dateCreated || new Date().toISOString()}"
      crs:Title="${preset.title}"
      crs:Description="${preset.description || ""}"
      ${
        toneCurve?.rgb
          ? `crs:ToneCurvePV2012="${formatToneCurve(toneCurve.rgb)}"`
          : ""
      }
      ${
        toneCurve?.red
          ? `crs:ToneCurvePV2012Red="${formatToneCurve(toneCurve.red)}"`
          : ""
      }
      ${
        toneCurve?.green
          ? `crs:ToneCurvePV2012Green="${formatToneCurve(toneCurve.green)}"`
          : ""
      }
      ${
        toneCurve?.blue
          ? `crs:ToneCurvePV2012Blue="${formatToneCurve(toneCurve.blue)}"`
          : ""
      }
      ${
        toneCurve?.rgb
          ? 'crs:ToneCurveName2012="Custom"'
          : 'crs:ToneCurveName2012="Linear"'
      }
      ${
        settings.colorAdjustments?.red
          ? `crs:HueAdjustmentRed="${formatNumber(
              settings.colorAdjustments.red.hue
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.red
          ? `crs:SaturationAdjustmentRed="${formatNumber(
              settings.colorAdjustments.red.saturation
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.red
          ? `crs:LuminanceAdjustmentRed="${formatNumber(
              settings.colorAdjustments.red.luminance
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.orange
          ? `crs:HueAdjustmentOrange="${formatNumber(
              settings.colorAdjustments.orange.hue
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.orange
          ? `crs:SaturationAdjustmentOrange="${formatNumber(
              settings.colorAdjustments.orange.saturation
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.orange
          ? `crs:LuminanceAdjustmentOrange="${formatNumber(
              settings.colorAdjustments.orange.luminance
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.yellow
          ? `crs:HueAdjustmentYellow="${formatNumber(
              settings.colorAdjustments.yellow.hue
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.yellow
          ? `crs:SaturationAdjustmentYellow="${formatNumber(
              settings.colorAdjustments.yellow.saturation
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.yellow
          ? `crs:LuminanceAdjustmentYellow="${formatNumber(
              settings.colorAdjustments.yellow.luminance
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.green
          ? `crs:HueAdjustmentGreen="${formatNumber(
              settings.colorAdjustments.green.hue
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.green
          ? `crs:SaturationAdjustmentGreen="${formatNumber(
              settings.colorAdjustments.green.saturation
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.green
          ? `crs:LuminanceAdjustmentGreen="${formatNumber(
              settings.colorAdjustments.green.luminance
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.aqua
          ? `crs:HueAdjustmentAqua="${formatNumber(
              settings.colorAdjustments.aqua.hue
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.aqua
          ? `crs:SaturationAdjustmentAqua="${formatNumber(
              settings.colorAdjustments.aqua.saturation
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.aqua
          ? `crs:LuminanceAdjustmentAqua="${formatNumber(
              settings.colorAdjustments.aqua.luminance
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.blue
          ? `crs:HueAdjustmentBlue="${formatNumber(
              settings.colorAdjustments.blue.hue
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.blue
          ? `crs:SaturationAdjustmentBlue="${formatNumber(
              settings.colorAdjustments.blue.saturation
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.blue
          ? `crs:LuminanceAdjustmentBlue="${formatNumber(
              settings.colorAdjustments.blue.luminance
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.purple
          ? `crs:HueAdjustmentPurple="${formatNumber(
              settings.colorAdjustments.purple.hue
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.purple
          ? `crs:SaturationAdjustmentPurple="${formatNumber(
              settings.colorAdjustments.purple.saturation
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.purple
          ? `crs:LuminanceAdjustmentPurple="${formatNumber(
              settings.colorAdjustments.purple.luminance
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.magenta
          ? `crs:HueAdjustmentMagenta="${formatNumber(
              settings.colorAdjustments.magenta.hue
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.magenta
          ? `crs:SaturationAdjustmentMagenta="${formatNumber(
              settings.colorAdjustments.magenta.saturation
            )}"`
          : ""
      }
      ${
        settings.colorAdjustments?.magenta
          ? `crs:LuminanceAdjustmentMagenta="${formatNumber(
              settings.colorAdjustments.magenta.luminance
            )}"`
          : ""
      }
      crs:EnableLensProfileCorrections="False"
      crs:LensProfileName=""
      crs:LensManualDistortionAmount="0"
      crs:PerspectiveUpright="Off"
      crs:AutoLateralCA="False"
      crs:RemoveChromaticAberration="False"
      crs:VignetteAmount="0"
      crs:VignetteMidpoint="50"
      crs:PerspectiveVertical="0"
      crs:PerspectiveHorizontal="0"
      crs:PerspectiveRotate="0"
      crs:PerspectiveScale="100"
      crs:PerspectiveAspect="0"
      crs:AutoPerspective="False"
      crs:PostCropVignetteAmount="0"
      crs:PostCropVignetteMidpoint="50"
      crs:PostCropVignetteFeather="50"
      crs:PostCropVignetteRoundness="0"
      crs:PostCropVignetteStyle="1"
      crs:CameraCalibrationBluePrimaryHue="0"
      crs:CameraCalibrationBluePrimarySaturation="0"
      crs:CameraCalibrationGreenPrimaryHue="0"
      crs:CameraCalibrationGreenPrimarySaturation="0"
      crs:CameraCalibrationRedPrimaryHue="0"
      crs:CameraCalibrationRedPrimarySaturation="0"
      crs:CameraCalibrationShadowTint="0"
      crs:CameraCalibrationVersion="1.0"
      crs:CropTop="0"
      crs:CropLeft="0"
      crs:CropBottom="0"
      crs:CropRight="0"
      crs:CropAngle="0"
      crs:CropConstrainToWarp="False"
      crs:Orientation="0"
      crs:Rating="0"
      crs:Label=""
      crs:LookTableName=""
      crs:ColorGradeShadowHue="0"
      crs:ColorGradeShadowSat="0"
      crs:ColorGradeMidtoneHue="0"
      crs:ColorGradeMidtoneSat="0"
      crs:ColorGradeHighlightHue="0"
      crs:ColorGradeHighlightSat="0"
      crs:ColorGradeBlending="50"
      crs:ColorGradeGlobalHue="0"
      crs:ColorGradeGlobalSat="0"
      crs:ColorGradePerceptual="False"
      crs:SplitToningShadowHue="0"
      crs:SplitToningShadowSaturation="0"
      crs:SplitToningHighlightHue="0"
      crs:SplitToningHighlightSaturation="0"
      crs:SplitToningBalance="0">
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>`;

  return xmpTemplate;
};

// Helper function to create and download the XMP file
export const downloadXMP = (preset: PresetData, filename?: string): void => {
  const xmpContent = compileXMP(preset);
  const blob = new Blob([xmpContent], { type: "application/xml" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download =
    filename || `${preset.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.xmp`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
