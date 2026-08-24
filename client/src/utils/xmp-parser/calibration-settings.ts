import { ParsedSettings } from "../../types/xmpSettings";
import { convertToDatabaseValue, getCrsValue } from "./core";

export const parseCalibrationSettings = (
  description: Element
): Partial<ParsedSettings> => {
  const getAttr = (name: string): string => getCrsValue(description, name);

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
