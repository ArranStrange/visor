import { ParsedSettings } from "../../types/xmpSettings";
import { convertToDatabaseValue, getCrsValue } from "./core";

export const parseLensAndOpticsSettings = (
  description: Element
): Partial<ParsedSettings> => {
  const getAttr = (name: string): string => getCrsValue(description, name);

  const getBoolAttr = (name: string): boolean =>
    getCrsValue(description, name) === "True";

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
