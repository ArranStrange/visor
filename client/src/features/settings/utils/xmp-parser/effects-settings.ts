import { ParsedSettings } from "@/types/xmpSettings";
import { convertToDatabaseValue, getCrsValue } from "@/features/settings/utils/xmp-parser/core";

export const parseEffectsSettings = (
  description: Element
): Partial<ParsedSettings> => {
  const getAttr = (name: string): string => getCrsValue(description, name);

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
