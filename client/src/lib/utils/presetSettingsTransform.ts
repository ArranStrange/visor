import { ParsedSettings } from "types/xmpSettings";
import { PresetSettings, ToneCurve as ToneCurveType } from "types/graphql";

export const buildSettingsForBackend = (
  parsed: ParsedSettings
): PresetSettings => ({
  // Light settings
  exposure: Number(parsed.exposure) || 0,
  contrast: Number(parsed.contrast) || 0,
  highlights: Number(parsed.highlights) || 0,
  shadows: Number(parsed.shadows) || 0,
  whites: Number(parsed.whites) || 0,
  blacks: Number(parsed.blacks) || 0,
  // Color settings
  temp: Number(parsed.temp) || 0,
  tint: Number(parsed.tint) || 0,
  vibrance: Number(parsed.vibrance) || 0,
  saturation: Number(parsed.saturation) || 0,
  // Effects
  clarity: Number(parsed.clarity) || 0,
  dehaze: Number(parsed.dehaze) || 0,
  grain: {
    amount: Number(parsed.effects?.grainAmount) || 0,
    size: Number(parsed.effects?.grainSize) || 0,
    roughness: Number(parsed.effects?.grainFrequency) || 0,
  },
  vignette: {
    amount: Number(parsed.effects?.postCropVignetteAmount) || 0,
  },
  colorAdjustments: {
    red: {
      hue: Number(parsed.colorAdjustments?.red?.hue) || 0,
      saturation: Number(parsed.colorAdjustments?.red?.saturation) || 0,
      luminance: Number(parsed.colorAdjustments?.red?.luminance) || 0,
    },
    orange: {
      saturation: Number(parsed.colorAdjustments?.orange?.saturation) || 0,
      luminance: Number(parsed.colorAdjustments?.orange?.luminance) || 0,
    },
    yellow: {
      hue: Number(parsed.colorAdjustments?.yellow?.hue) || 0,
      saturation: Number(parsed.colorAdjustments?.yellow?.saturation) || 0,
      luminance: Number(parsed.colorAdjustments?.yellow?.luminance) || 0,
    },
    green: {
      hue: Number(parsed.colorAdjustments?.green?.hue) || 0,
      saturation: Number(parsed.colorAdjustments?.green?.saturation) || 0,
    },
    blue: {
      hue: Number(parsed.colorAdjustments?.blue?.hue) || 0,
      saturation: Number(parsed.colorAdjustments?.blue?.saturation) || 0,
    },
  },
  splitToning: {
    shadowHue: Number(parsed.splitToning?.shadowHue) || 0,
    shadowSaturation: Number(parsed.splitToning?.shadowSaturation) || 0,
    highlightHue: Number(parsed.splitToning?.highlightHue) || 0,
    highlightSaturation: Number(parsed.splitToning?.highlightSaturation) || 0,
    balance: Number(parsed.splitToning?.balance) || 0,
  },
  sharpening: Number(parsed.texture) || 0,
  noiseReduction: {
    luminance: Number(parsed.detail?.luminanceSmoothing) || 0,
    detail: Number(parsed.detail?.luminanceDetail) || 0,
    color: Number(parsed.detail?.colorNoiseReduction) || 0,
  },
});

export const buildToneCurveForBackend = (
  parsed: ParsedSettings
): ToneCurveType => {
  if (!parsed.toneCurve) {
    return {
      rgb: [
        { x: 0, y: 0 },
        { x: 255, y: 255 },
      ],
      red: [
        { x: 0, y: 0 },
        { x: 255, y: 255 },
      ],
      green: [
        { x: 0, y: 0 },
        { x: 255, y: 255 },
      ],
      blue: [
        { x: 0, y: 0 },
        { x: 255, y: 255 },
      ],
    };
  }

  const ensureValidPoints = (points: any[] | undefined) => {
    if (!points || !Array.isArray(points)) return [];
    return points
      .map((point) => ({
        x: Number(point.x) || 0,
        y: Number(point.y) || 0,
      }))
      .filter((point) => !isNaN(point.x) && !isNaN(point.y));
  };

  return {
    rgb: ensureValidPoints(parsed.toneCurve.rgb),
    red: ensureValidPoints(parsed.toneCurve.red),
    green: ensureValidPoints(parsed.toneCurve.green),
    blue: ensureValidPoints(parsed.toneCurve.blue),
  };
};
