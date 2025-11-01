/**
 * Utility script to test XMP parser with actual XMP files
 * This can be run in the browser console or as a standalone test
 */

import { SettingsParser } from "../components/settings/SettingsParser";
import { ParsedSettings } from "../types/xmpSettings";

export interface XmpParserTestResult {
  success: boolean;
  parsedSettings: ParsedSettings | null;
  errors: string[];
  extractedValues: {
    exposure?: number;
    contrast?: number;
    highlights?: number;
    shadows?: number;
    whites?: number;
    blacks?: number;
    clarity?: number;
    vibrance?: number;
    saturation?: number;
    toneCurve?: {
      rgb: Array<{ x: number; y: number }>;
      red: Array<{ x: number; y: number }>;
      green: Array<{ x: number; y: number }>;
      blue: Array<{ x: number; y: number }>;
    };
    colorAdjustments?: ParsedSettings["colorAdjustments"];
  };
}

export const testXmpParser = async (
  xmpFileContent: string
): Promise<XmpParserTestResult> => {
  const result: XmpParserTestResult = {
    success: false,
    parsedSettings: null,
    errors: [],
    extractedValues: {},
  };

  try {
    // Parse the XMP content
    const parsedSettings = SettingsParser.parseXmpContent(xmpFileContent);
    result.parsedSettings = parsedSettings;
    result.success = true;

    // Extract key values for verification
    result.extractedValues = {
      exposure: parsedSettings.exposure,
      contrast: parsedSettings.contrast,
      highlights: parsedSettings.highlights,
      shadows: parsedSettings.shadows,
      whites: parsedSettings.whites,
      blacks: parsedSettings.blacks,
      clarity: parsedSettings.clarity,
      vibrance: parsedSettings.vibrance,
      saturation: parsedSettings.saturation,
      toneCurve: parsedSettings.toneCurve,
      colorAdjustments: parsedSettings.colorAdjustments,
    };

    // Validate key values based on expected XMP file content
    // For "Duotone cyan.xmp":
    // - Contrast2012="+5" -> should be 500
    // - Highlights2012="-25" -> should be -2500
    // - Shadows2012="+40" -> should be 4000
    // - Whites2012="-10" -> should be -1000
    // - Blacks2012="+30" -> should be 3000
    // - Clarity2012="+30" -> should be 3000
    // - Vibrance="-5" -> should be -500
    // - Saturation="-5" -> should be -500

    const validationErrors: string[] = [];

    // Check if parsed values make sense (non-null, not undefined)
    if (
      parsedSettings.contrast === undefined ||
      parsedSettings.contrast === null
    ) {
      validationErrors.push("Contrast value is missing");
    }
    if (
      parsedSettings.highlights === undefined ||
      parsedSettings.highlights === null
    ) {
      validationErrors.push("Highlights value is missing");
    }
    if (
      parsedSettings.shadows === undefined ||
      parsedSettings.shadows === null
    ) {
      validationErrors.push("Shadows value is missing");
    }
    if (parsedSettings.whites === undefined || parsedSettings.whites === null) {
      validationErrors.push("Whites value is missing");
    }
    if (parsedSettings.blacks === undefined || parsedSettings.blacks === null) {
      validationErrors.push("Blacks value is missing");
    }
    if (
      parsedSettings.clarity === undefined ||
      parsedSettings.clarity === null
    ) {
      validationErrors.push("Clarity value is missing");
    }

    if (validationErrors.length > 0) {
      result.errors = validationErrors;
    }

    console.log("✅ XMP Parser Test Results:");
    console.log("Parsed Settings:", parsedSettings);
    console.log("Extracted Values:", result.extractedValues);
    if (validationErrors.length > 0) {
      console.warn("⚠️ Validation Errors:", validationErrors);
    }
  } catch (error: any) {
    result.success = false;
    result.errors = [error.message || "Unknown error parsing XMP file"];
    console.error("❌ XMP Parser Test Failed:", error);
  }

  return result;
};

/**
 * Test the XMP parser with a file from the file system
 * Usage: testXmpParserFromFile(file) where file is a File object
 */
export const testXmpParserFromFile = async (
  file: File
): Promise<XmpParserTestResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const result = await testXmpParser(content);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsText(file);
  });
};
