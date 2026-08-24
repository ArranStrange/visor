import { PresetSettings } from "./types";
import { convertToXMPValue } from "./xmp-value";

export const buildColorAdjustmentAttributes = (
  colorAdjustments: PresetSettings["colorAdjustments"]
): string => `
      ${
        colorAdjustments?.red
          ? `crs:HueAdjustmentRed="${convertToXMPValue(
              colorAdjustments.red.hue
            )}"`
          : ""
      }
      ${
        colorAdjustments?.red
          ? `crs:SaturationAdjustmentRed="${convertToXMPValue(
              colorAdjustments.red.saturation
            )}"`
          : ""
      }
      ${
        colorAdjustments?.red
          ? `crs:LuminanceAdjustmentRed="${convertToXMPValue(
              colorAdjustments.red.luminance
            )}"`
          : ""
      }
      ${
        colorAdjustments?.orange
          ? `crs:HueAdjustmentOrange="${convertToXMPValue(
              colorAdjustments.orange.hue
            )}"`
          : ""
      }
      ${
        colorAdjustments?.orange
          ? `crs:SaturationAdjustmentOrange="${convertToXMPValue(
              colorAdjustments.orange.saturation
            )}"`
          : ""
      }
      ${
        colorAdjustments?.orange
          ? `crs:LuminanceAdjustmentOrange="${convertToXMPValue(
              colorAdjustments.orange.luminance
            )}"`
          : ""
      }
      ${
        colorAdjustments?.yellow
          ? `crs:HueAdjustmentYellow="${convertToXMPValue(
              colorAdjustments.yellow.hue
            )}"`
          : ""
      }
      ${
        colorAdjustments?.yellow
          ? `crs:SaturationAdjustmentYellow="${convertToXMPValue(
              colorAdjustments.yellow.saturation
            )}"`
          : ""
      }
      ${
        colorAdjustments?.yellow
          ? `crs:LuminanceAdjustmentYellow="${convertToXMPValue(
              colorAdjustments.yellow.luminance
            )}"`
          : ""
      }
      ${
        colorAdjustments?.green
          ? `crs:HueAdjustmentGreen="${convertToXMPValue(
              colorAdjustments.green.hue
            )}"`
          : ""
      }
      ${
        colorAdjustments?.green
          ? `crs:SaturationAdjustmentGreen="${convertToXMPValue(
              colorAdjustments.green.saturation
            )}"`
          : ""
      }
      ${
        colorAdjustments?.green
          ? `crs:LuminanceAdjustmentGreen="${convertToXMPValue(
              colorAdjustments.green.luminance
            )}"`
          : ""
      }
      ${
        colorAdjustments?.aqua
          ? `crs:HueAdjustmentAqua="${convertToXMPValue(
              colorAdjustments.aqua.hue
            )}"`
          : ""
      }
      ${
        colorAdjustments?.aqua
          ? `crs:SaturationAdjustmentAqua="${convertToXMPValue(
              colorAdjustments.aqua.saturation
            )}"`
          : ""
      }
      ${
        colorAdjustments?.aqua
          ? `crs:LuminanceAdjustmentAqua="${convertToXMPValue(
              colorAdjustments.aqua.luminance
            )}"`
          : ""
      }
      ${
        colorAdjustments?.blue
          ? `crs:HueAdjustmentBlue="${convertToXMPValue(
              colorAdjustments.blue.hue
            )}"`
          : ""
      }
      ${
        colorAdjustments?.blue
          ? `crs:SaturationAdjustmentBlue="${convertToXMPValue(
              colorAdjustments.blue.saturation
            )}"`
          : ""
      }
      ${
        colorAdjustments?.blue
          ? `crs:LuminanceAdjustmentBlue="${convertToXMPValue(
              colorAdjustments.blue.luminance
            )}"`
          : ""
      }
      ${
        colorAdjustments?.purple
          ? `crs:HueAdjustmentPurple="${convertToXMPValue(
              colorAdjustments.purple.hue
            )}"`
          : ""
      }
      ${
        colorAdjustments?.purple
          ? `crs:SaturationAdjustmentPurple="${convertToXMPValue(
              colorAdjustments.purple.saturation
            )}"`
          : ""
      }
      ${
        colorAdjustments?.purple
          ? `crs:LuminanceAdjustmentPurple="${convertToXMPValue(
              colorAdjustments.purple.luminance
            )}"`
          : ""
      }
      ${
        colorAdjustments?.magenta
          ? `crs:HueAdjustmentMagenta="${convertToXMPValue(
              colorAdjustments.magenta.hue
            )}"`
          : ""
      }
      ${
        colorAdjustments?.magenta
          ? `crs:SaturationAdjustmentMagenta="${convertToXMPValue(
              colorAdjustments.magenta.saturation
            )}"`
          : ""
      }
      ${
        colorAdjustments?.magenta
          ? `crs:LuminanceAdjustmentMagenta="${convertToXMPValue(
              colorAdjustments.magenta.luminance
            )}"`
          : ""
      }`;
