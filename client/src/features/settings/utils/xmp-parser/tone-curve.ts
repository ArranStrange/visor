import { ParsedSettings } from "@/types/xmpSettings";
import { getCrsValue } from "@/features/settings/utils/xmp-parser/core";

export const parseToneCurve = (
  curveData: string
): Array<{ x: number; y: number }> => {
  if (!curveData) return [];
  return curveData.split(",").map((point) => {
    const [x, y] = point.split(" ").map(Number);
    return { x, y };
  });
};

export const parseToneCurveSettings = (
  description: Element
): Partial<ParsedSettings> => {
  const getAttr = (name: string): string => getCrsValue(description, name);

  // Helper function to parse tone curve from XML element structure
  // Format: <crs:ToneCurvePV2012><rdf:Seq><rdf:li>x, y</rdf:li>...</rdf:Seq></crs:ToneCurvePV2012>
  const parseToneCurveElement = (
    elementName: string
  ): Array<{ x: number; y: number }> => {
    const curveElement = description.getElementsByTagName(
      `crs:${elementName}`
    )[0];
    if (!curveElement) return [];

    const seqElement = curveElement.getElementsByTagName("rdf:Seq")[0];
    if (!seqElement) return [];

    const points: Array<{ x: number; y: number }> = [];
    const liElements = seqElement.getElementsByTagName("rdf:li");

    for (let i = 0; i < liElements.length; i++) {
      const text = liElements[i].textContent?.trim() || "";
      if (text) {
        const [x, y] = text.split(",").map((val) => Number(val.trim()));
        if (!isNaN(x) && !isNaN(y)) {
          points.push({ x, y });
        }
      }
    }

    return points;
  };

  const toneCurveName = getAttr("ToneCurveName2012");
  const settings: Partial<ParsedSettings> = { toneCurveName };

  if (toneCurveName === "Custom") {
    settings.toneCurve = {
      rgb: parseToneCurveElement("ToneCurvePV2012"),
      red: parseToneCurveElement("ToneCurvePV2012Red"),
      green: parseToneCurveElement("ToneCurvePV2012Green"),
      blue: parseToneCurveElement("ToneCurvePV2012Blue"),
    };
  }

  return settings;
};
