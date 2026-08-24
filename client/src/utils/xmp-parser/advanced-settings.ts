import { ParsedSettings } from "../../types/xmpSettings";
import { convertToDatabaseValue, getCrsValue } from "./core";

export const parseAdvancedSettings = (
  description: Element
): Partial<ParsedSettings> => {
  const getAttr = (name: string): string => getCrsValue(description, name);

  const getBoolAttr = (name: string): boolean =>
    getCrsValue(description, name) === "True";

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
