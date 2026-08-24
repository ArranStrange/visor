import { ToneCurve, ToneCurvePoint } from "./types";

// Helper function to convert tone curve array to XMP format
export const formatToneCurve = (curve: ToneCurvePoint[]): string => {
  if (!curve || curve.length === 0) return "";

  return curve.map((point) => `${point.x} ${point.y}`).join(", ");
};

export const buildToneCurveAttributes = (
  toneCurve: ToneCurve | undefined
): string => `
      ${
        toneCurve?.rgb
          ? `crs:ToneCurvePV2012="${formatToneCurve(toneCurve.rgb)}"`
          : ""
      }
      ${
        toneCurve?.red
          ? `crs:ToneCurvePV2012Red="${formatToneCurve(toneCurve.red)}"`
          : ""
      }
      ${
        toneCurve?.green
          ? `crs:ToneCurvePV2012Green="${formatToneCurve(toneCurve.green)}"`
          : ""
      }
      ${
        toneCurve?.blue
          ? `crs:ToneCurvePV2012Blue="${formatToneCurve(toneCurve.blue)}"`
          : ""
      }
      ${
        toneCurve?.rgb
          ? 'crs:ToneCurveName2012="Custom"'
          : 'crs:ToneCurveName2012="Linear"'
      }`;
