import { ParsedSettings } from "../../types/xmpSettings";
import { convertToDatabaseValue, getCrsValue } from "./core";

export const parseColorAdjustments = (
  description: Element
): Partial<ParsedSettings> => {
  const getAttr = (name: string): string => getCrsValue(description, name);

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
