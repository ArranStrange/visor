import { ParsedSettings } from "../types/xmpSettings";

export const convertToDatabaseValue = (value: string): number => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : Math.round(num * 100);
};

export const parseToneCurve = (
  curveData: string
): Array<{ x: number; y: number }> => {
  if (!curveData) return [];
  return curveData.split(",").map((point) => {
    const [x, y] = point.split(" ").map(Number);
    return { x, y };
  });
};

export const parseBasicSettings = (
  description: Element
): Partial<ParsedSettings> => {
  const getAttr = (name: string): string => {
    return description.getAttribute(`crs:${name}`) || "0";
  };

  return {
    version: getAttr("Version"),
    processVersion: getAttr("ProcessVersion"),
    cameraProfile: getAttr("CameraProfile"),
    cameraProfileDigest: getAttr("CameraProfileDigest"),
    profileName: getAttr("ProfileName"),
    lookTableName: getAttr("LookTableName"),
    whiteBalance: getAttr("WhiteBalance"),
  };
};

export const parseExposureSettings = (
  description: Element
): Partial<ParsedSettings> => {
  const getAttr = (name: string): string => {
    return description.getAttribute(`crs:${name}`) || "0";
  };

  return {
    exposure: convertToDatabaseValue(getAttr("Exposure2012")),
    contrast: convertToDatabaseValue(getAttr("Contrast2012")),
    highlights: convertToDatabaseValue(getAttr("Highlights2012")),
    shadows: convertToDatabaseValue(getAttr("Shadows2012")),
    whites: convertToDatabaseValue(getAttr("Whites2012")),
    blacks: convertToDatabaseValue(getAttr("Blacks2012")),
    clarity: convertToDatabaseValue(getAttr("Clarity2012")),
    dehaze: convertToDatabaseValue(getAttr("Dehaze")),
    texture: convertToDatabaseValue(getAttr("Texture")),
    vibrance: convertToDatabaseValue(getAttr("Vibrance")),
    saturation: convertToDatabaseValue(getAttr("Saturation")),
    temp: convertToDatabaseValue(getAttr("Temperature")),
    tint: convertToDatabaseValue(getAttr("Tint")),
  };
};

export const parseToneCurveSettings = (
  description: Element
): Partial<ParsedSettings> => {
  const getAttr = (name: string): string => {
    return description.getAttribute(`crs:${name}`) || "0";
  };

  // Helper function to parse tone curve from XML element structure
  // Format: <crs:ToneCurvePV2012><rdf:Seq><rdf:li>x, y</rdf:li>...</rdf:Seq></crs:ToneCurvePV2012>
  const parseToneCurveElement = (
    elementName: string
  ): Array<{ x: number; y: number }> => {
    const curveElement = description.getElementsByTagName(
      `crs:${elementName}`
    )[0];
    if (!curveElement) return [];

    const seqElement = curveElement.getElementsByTagName("rdf:Seq")[0];
    if (!seqElement) return [];

    const points: Array<{ x: number; y: number }> = [];
    const liElements = seqElement.getElementsByTagName("rdf:li");

    for (let i = 0; i < liElements.length; i++) {
      const text = liElements[i].textContent?.trim() || "";
      if (text) {
        const [x, y] = text.split(",").map((val) => Number(val.trim()));
        if (!isNaN(x) && !isNaN(y)) {
          points.push({ x, y });
        }
      }
    }

    return points;
  };

  const toneCurveName = getAttr("ToneCurveName2012");
  const settings: Partial<ParsedSettings> = { toneCurveName };

  if (toneCurveName === "Custom") {
    settings.toneCurve = {
      rgb: parseToneCurveElement("ToneCurvePV2012"),
      red: parseToneCurveElement("ToneCurvePV2012Red"),
      green: parseToneCurveElement("ToneCurvePV2012Green"),
      blue: parseToneCurveElement("ToneCurvePV2012Blue"),
    };
  }

  return settings;
};

export const parseColorAdjustments = (
  description: Element
): Partial<ParsedSettings> => {
  const getAttr = (name: string): string => {
    return description.getAttribute(`crs:${name}`) || "0";
  };

  const colorAdjustments = {
    red: {
      hue: convertToDatabaseValue(getAttr("HueAdjustmentRed")),
      saturation: convertToDatabaseValue(getAttr("SaturationAdjustmentRed")),
      luminance: convertToDatabaseValue(getAttr("LuminanceAdjustmentRed")),
    },
    orange: {
      hue: convertToDatabaseValue(getAttr("HueAdjustmentOrange")),
      saturation: convertToDatabaseValue(getAttr("SaturationAdjustmentOrange")),
      luminance: convertToDatabaseValue(getAttr("LuminanceAdjustmentOrange")),
    },
    yellow: {
      hue: convertToDatabaseValue(getAttr("HueAdjustmentYellow")),
      saturation: convertToDatabaseValue(getAttr("SaturationAdjustmentYellow")),
      luminance: convertToDatabaseValue(getAttr("LuminanceAdjustmentYellow")),
    },
    green: {
      hue: convertToDatabaseValue(getAttr("HueAdjustmentGreen")),
      saturation: convertToDatabaseValue(getAttr("SaturationAdjustmentGreen")),
      luminance: convertToDatabaseValue(getAttr("LuminanceAdjustmentGreen")),
    },
    aqua: {
      hue: convertToDatabaseValue(getAttr("HueAdjustmentAqua")),
      saturation: convertToDatabaseValue(getAttr("SaturationAdjustmentAqua")),
      luminance: convertToDatabaseValue(getAttr("LuminanceAdjustmentAqua")),
    },
    blue: {
      hue: convertToDatabaseValue(getAttr("HueAdjustmentBlue")),
      saturation: convertToDatabaseValue(getAttr("SaturationAdjustmentBlue")),
      luminance: convertToDatabaseValue(getAttr("LuminanceAdjustmentBlue")),
    },
    purple: {
      hue: convertToDatabaseValue(getAttr("HueAdjustmentPurple")),
      saturation: convertToDatabaseValue(getAttr("SaturationAdjustmentPurple")),
      luminance: convertToDatabaseValue(getAttr("LuminanceAdjustmentPurple")),
    },
    magenta: {
      hue: convertToDatabaseValue(getAttr("HueAdjustmentMagenta")),
      saturation: convertToDatabaseValue(
        getAttr("SaturationAdjustmentMagenta")
      ),
      luminance: convertToDatabaseValue(getAttr("LuminanceAdjustmentMagenta")),
    },
  };

  return { colorAdjustments };
};

export const parseAdvancedSettings = (
  description: Element
): Partial<ParsedSettings> => {
  const getAttr = (name: string): string => {
    return description.getAttribute(`crs:${name}`) || "0";
  };

  const getBoolAttr = (name: string): boolean => {
    return description.getAttribute(`crs:${name}`) === "True";
  };

  return {
    splitToning: {
      shadowHue: convertToDatabaseValue(getAttr("SplitToningShadowHue")),
      shadowSaturation: convertToDatabaseValue(
        getAttr("SplitToningShadowSaturation")
      ),
      highlightHue: convertToDatabaseValue(getAttr("SplitToningHighlightHue")),
      highlightSaturation: convertToDatabaseValue(
        getAttr("SplitToningHighlightSaturation")
      ),
      balance: convertToDatabaseValue(getAttr("SplitToningBalance")),
    },
    colorGrading: {
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
      highlightHue: convertToDatabaseValue(getAttr("ColorGradeHighlightHue")),
      highlightSat: convertToDatabaseValue(getAttr("ColorGradeHighlightSat")),
      highlightLuminance: convertToDatabaseValue(
        getAttr("ColorGradeHighlightLuminance") || "0"
      ),
      blending: convertToDatabaseValue(getAttr("ColorGradeBlending")),
      balance: convertToDatabaseValue(getAttr("ColorGradeBalance") || "0"),
      globalHue: convertToDatabaseValue(getAttr("ColorGradeGlobalHue")),
      globalSat: convertToDatabaseValue(getAttr("ColorGradeGlobalSat")),
      perceptual: getBoolAttr("ColorGradePerceptual"),
    },
    detail: {
      sharpness: convertToDatabaseValue(getAttr("Sharpness")),
      sharpenRadius: convertToDatabaseValue(getAttr("SharpenRadius")),
      sharpenDetail: convertToDatabaseValue(getAttr("SharpenDetail")),
      sharpenEdgeMasking: convertToDatabaseValue(getAttr("SharpenEdgeMasking")),
      luminanceSmoothing: convertToDatabaseValue(getAttr("LuminanceSmoothing")),
      luminanceDetail: convertToDatabaseValue(getAttr("LuminanceDetail")),
      luminanceContrast: convertToDatabaseValue(getAttr("LuminanceContrast")),
      colorNoiseReduction: convertToDatabaseValue(
        getAttr("ColorNoiseReduction")
      ),
      colorNoiseReductionDetail: convertToDatabaseValue(
        getAttr("ColorNoiseReductionDetail")
      ),
      colorNoiseReductionSmoothness: convertToDatabaseValue(
        getAttr("ColorNoiseReductionSmoothness")
      ),
    },
  };
};

export const parseLensAndOpticsSettings = (
  description: Element
): Partial<ParsedSettings> => {
  const getAttr = (name: string): string => {
    return description.getAttribute(`crs:${name}`) || "0";
  };

  const getBoolAttr = (name: string): boolean => {
    return description.getAttribute(`crs:${name}`) === "True";
  };

  return {
    lensCorrections: {
      enableLensProfileCorrections: getBoolAttr("EnableLensProfileCorrections"),
      lensProfileName: getAttr("LensProfileName"),
      lensManualDistortionAmount: convertToDatabaseValue(
        getAttr("LensManualDistortionAmount")
      ),
      perspectiveUpright: getAttr("PerspectiveUpright"),
      autoLateralCA: getBoolAttr("AutoLateralCA"),
    },
    optics: {
      removeChromaticAberration: getBoolAttr("RemoveChromaticAberration"),
      vignetteAmount: convertToDatabaseValue(getAttr("VignetteAmount")),
      vignetteMidpoint: convertToDatabaseValue(getAttr("VignetteMidpoint")),
    },
  };
};

export const parseTransformSettings = (
  description: Element
): Partial<ParsedSettings> => {
  const getAttr = (name: string): string => {
    return description.getAttribute(`crs:${name}`) || "0";
  };

  const getBoolAttr = (name: string): boolean => {
    return description.getAttribute(`crs:${name}`) === "True";
  };

  return {
    transform: {
      perspectiveVertical: convertToDatabaseValue(
        getAttr("PerspectiveVertical")
      ),
      perspectiveHorizontal: convertToDatabaseValue(
        getAttr("PerspectiveHorizontal")
      ),
      perspectiveRotate: convertToDatabaseValue(getAttr("PerspectiveRotate")),
      perspectiveScale: convertToDatabaseValue(getAttr("PerspectiveScale")),
      perspectiveAspect: convertToDatabaseValue(getAttr("PerspectiveAspect")),
      autoPerspective: getBoolAttr("AutoPerspective"),
    },
  };
};

export const parseEffectsSettings = (
  description: Element
): Partial<ParsedSettings> => {
  const getAttr = (name: string): string => {
    return description.getAttribute(`crs:${name}`) || "0";
  };

  return {
    effects: {
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
    },
  };
};

export const parseCalibrationSettings = (
  description: Element
): Partial<ParsedSettings> => {
  const getAttr = (name: string): string => {
    return description.getAttribute(`crs:${name}`) || "0";
  };

  return {
    calibration: {
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
    },
  };
};

export const parseCropSettings = (
  description: Element
): Partial<ParsedSettings> => {
  const getAttr = (name: string): string => {
    return description.getAttribute(`crs:${name}`) || "0";
  };

  const getBoolAttr = (name: string): boolean => {
    return description.getAttribute(`crs:${name}`) === "True";
  };

  return {
    crop: {
      cropTop: convertToDatabaseValue(getAttr("CropTop")),
      cropLeft: convertToDatabaseValue(getAttr("CropLeft")),
      cropBottom: convertToDatabaseValue(getAttr("CropBottom")),
      cropRight: convertToDatabaseValue(getAttr("CropRight")),
      cropAngle: convertToDatabaseValue(getAttr("CropAngle")),
      cropConstrainToWarp: getBoolAttr("CropConstrainToWarp"),
    },
    orientation: getAttr("Orientation"),
  };
};

export const parseMetadataSettings = (
  description: Element
): Partial<ParsedSettings> => {
  const getAttr = (name: string): string => {
    return description.getAttribute(`crs:${name}`) || "0";
  };

  const getBoolAttr = (name: string): boolean => {
    return description.getAttribute(`crs:${name}`) === "True";
  };

  return {
    metadata: {
      rating: convertToDatabaseValue(getAttr("Rating")),
      label: getAttr("Label"),
      title: getAttr("Title"),
      creator: getAttr("Creator"),
      dateCreated: getAttr("DateCreated"),
    },
    hasSettings: getBoolAttr("HasSettings"),
    rawFileName: getAttr("RawFileName"),
    snapshot: getAttr("Snapshot"),
  };
};

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
