import { ParsedSettings } from "../../types/xmpSettings";
import { convertToDatabaseValue, getCrsValue } from "./core";

export const parseExposureSettings = (
  description: Element
): Partial<ParsedSettings> => {
  const getAttr = (name: string): string => getCrsValue(description, name);

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
