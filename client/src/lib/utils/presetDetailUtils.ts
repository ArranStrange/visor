import { ParsedSettings } from "types/xmpSettings";
import { buildSettingsObject } from "./xmpParserUtils";

interface PresetSettings {
  [key: string]: any;
}

interface Preset {
  version?: string;
  processVersion?: string;
  cameraProfile?: string;
  cameraProfileDigest?: string;
  profileName?: string;
  lookTableName?: string;
  whiteBalance?: string;
  settings?: PresetSettings;
  toneCurve?: any;
  colorGrading?: any;
  effects?: any;
  lensCorrections?: any;
  optics?: any;
  transform?: any;
  calibration?: any;
  crop?: any;
  orientation?: any;
}

export const convertPresetSettingsToParsedSettings = (
  presetSettings: PresetSettings | null | undefined,
  preset: Preset
): ParsedSettings => {
  const parsed: ParsedSettings = {
    version: preset.version,
    processVersion: preset.processVersion,
    cameraProfile: preset.cameraProfile,
    cameraProfileDigest: preset.cameraProfileDigest,
    profileName: preset.profileName,
    lookTableName: preset.lookTableName,
    whiteBalance: preset.whiteBalance,

    exposure: presetSettings?.exposure || 0,
    contrast: presetSettings?.contrast || 0,
    highlights: presetSettings?.highlights || 0,
    shadows: presetSettings?.shadows || 0,
    whites: presetSettings?.whites || 0,
    blacks: presetSettings?.blacks || 0,

    temp: presetSettings?.temp || 0,
    tint: presetSettings?.tint || 0,
    vibrance: presetSettings?.vibrance || 0,
    saturation: presetSettings?.saturation || 0,

    clarity: presetSettings?.clarity || 0,
    dehaze: presetSettings?.dehaze || 0,
    texture: presetSettings?.texture || 0,

    toneCurveName:
      preset.toneCurve &&
      (preset.toneCurve.rgb?.length > 0 ||
        preset.toneCurve.red?.length > 0 ||
        preset.toneCurve.green?.length > 0 ||
        preset.toneCurve.blue?.length > 0)
        ? "Custom"
        : "Linear",
    toneCurve:
      preset.toneCurve &&
      (preset.toneCurve.rgb?.length > 0 ||
        preset.toneCurve.red?.length > 0 ||
        preset.toneCurve.green?.length > 0 ||
        preset.toneCurve.blue?.length > 0)
        ? preset.toneCurve
        : undefined,

    colorAdjustments: presetSettings?.colorAdjustments || undefined,
    splitToning: presetSettings?.splitToning || undefined,
    colorGrading: preset.colorGrading || undefined,

    detail: {
      sharpness: presetSettings?.sharpening || 0,
      sharpenRadius: presetSettings?.sharpenRadius || 0,
      sharpenDetail: presetSettings?.sharpenDetail || 0,
      sharpenEdgeMasking: presetSettings?.sharpenEdgeMasking || 0,
      luminanceSmoothing: presetSettings?.luminanceSmoothing || 0,
      luminanceDetail: presetSettings?.luminanceDetail || 0,
      luminanceContrast: presetSettings?.luminanceContrast || 0,
      colorNoiseReduction: presetSettings?.noiseReduction?.color || 0,
      colorNoiseReductionDetail: presetSettings?.noiseReduction?.detail || 0,
      colorNoiseReductionSmoothness:
        presetSettings?.noiseReduction?.colorSmoothness || 0,
    },

    effects: {
      postCropVignetteAmount: presetSettings?.vignette?.amount || 0,
      postCropVignetteMidpoint: preset.effects?.postCropVignetteMidpoint || 0,
      postCropVignetteFeather: preset.effects?.postCropVignetteFeather || 0,
      postCropVignetteRoundness: preset.effects?.postCropVignetteRoundness || 0,
      postCropVignetteStyle: preset.effects?.postCropVignetteStyle || "",
      grainAmount: presetSettings?.grain?.amount || 0,
      grainSize: presetSettings?.grain?.size || 0,
      grainFrequency: presetSettings?.grain?.roughness || 0,
    },

    lensCorrections: preset.lensCorrections || undefined,
    optics: preset.optics || undefined,
    transform: preset.transform || undefined,
    calibration: preset.calibration || undefined,
    crop: preset.crop || undefined,
    orientation: preset.orientation,
  };

  return buildSettingsObject(parsed);
};

export const formatToneCurveData = (curveData: any) => {
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

export const stripTypename = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(stripTypename);
  if (typeof obj === "object") {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key !== "__typename") {
        cleaned[key] = stripTypename(value);
      }
    }
    return cleaned;
  }
  return obj;
};
