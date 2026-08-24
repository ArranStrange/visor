import { ParsedSettings } from "../../types/xmpSettings";

export const buildSettingsObject = (
  settings: ParsedSettings
): ParsedSettings => {
  return {
    ...settings,
    settings: {
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
    },
  };
};
