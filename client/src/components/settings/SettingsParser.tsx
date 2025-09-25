import { ParsedSettings } from "../../types/xmpSettings";
import {
  parseBasicSettings,
  parseExposureSettings,
  parseToneCurveSettings,
  parseColorAdjustments,
  parseAdvancedSettings,
  parseLensAndOpticsSettings,
  parseTransformSettings,
  parseEffectsSettings,
  parseCalibrationSettings,
  parseCropSettings,
  parseMetadataSettings,
  buildSettingsObject,
} from "../../utils/xmpParserUtils";

export class SettingsParser {
  static parseXmpContent(content: string): ParsedSettings {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, "text/xml");

    const description = xmlDoc.getElementsByTagName("rdf:Description")[0];
    if (!description) {
      throw new Error("No settings found in XMP file");
    }

    const basicSettings = parseBasicSettings(description);
    const exposureSettings = parseExposureSettings(description);
    const toneCurveSettings = parseToneCurveSettings(description);
    const colorAdjustments = parseColorAdjustments(description);
    const advancedSettings = parseAdvancedSettings(description);
    const lensAndOpticsSettings = parseLensAndOpticsSettings(description);
    const transformSettings = parseTransformSettings(description);
    const effectsSettings = parseEffectsSettings(description);
    const calibrationSettings = parseCalibrationSettings(description);
    const cropSettings = parseCropSettings(description);
    const metadataSettings = parseMetadataSettings(description);

    const combinedSettings: ParsedSettings = {
      ...basicSettings,
      ...exposureSettings,
      ...toneCurveSettings,
      ...colorAdjustments,
      ...advancedSettings,
      ...lensAndOpticsSettings,
      ...transformSettings,
      ...effectsSettings,
      ...calibrationSettings,
      ...cropSettings,
      ...metadataSettings,
    };

    return buildSettingsObject(combinedSettings);
  }
}
