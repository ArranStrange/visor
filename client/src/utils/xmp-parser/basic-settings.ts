import { ParsedSettings } from "../../types/xmpSettings";
import { getCrsValue } from "./core";

export const parseBasicSettings = (
  description: Element
): Partial<ParsedSettings> => {
  const getAttr = (name: string): string => getCrsValue(description, name);

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
