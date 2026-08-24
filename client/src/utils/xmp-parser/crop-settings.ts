import { ParsedSettings } from "../../types/xmpSettings";
import { convertToDatabaseValue, getCrsValue } from "./core";

export const parseCropSettings = (
  description: Element
): Partial<ParsedSettings> => {
  const getAttr = (name: string): string => getCrsValue(description, name);

  const getBoolAttr = (name: string): boolean =>
    getCrsValue(description, name) === "True";

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
