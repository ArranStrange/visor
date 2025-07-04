import { compileXMP, type PresetData } from "./xmpCompiler";

// Simple test to verify XMP compilation works
const testPreset: PresetData = {
  title: "Test Preset",
  description: "A test preset for XMP compilation",
  settings: {
    exposure: 5000, // 50 in XMP format
    contrast: 2000, // 20 in XMP format
    highlights: -3000, // -30 in XMP format
    shadows: 4000, // 40 in XMP format
    whites: 1000, // 10 in XMP format
    blacks: -2000, // -20 in XMP format
    temp: 5500, // 55 in XMP format
    tint: 1000, // 10 in XMP format
    vibrance: 3000, // 30 in XMP format
    saturation: 0, // 0 in XMP format
    clarity: 2000, // 20 in XMP format
    dehaze: 1000, // 10 in XMP format
    texture: 1500, // 15 in XMP format
    sharpening: 4000, // 40 in XMP format
    sharpenRadius: 1000, // 10 in XMP format
    sharpenDetail: 2500, // 25 in XMP format
    sharpenEdgeMasking: 500, // 5 in XMP format
    luminanceSmoothing: 2000, // 20 in XMP format
    luminanceDetail: 500, // 5 in XMP format
    luminanceContrast: 0, // 0 in XMP format
    noiseReduction: {
      luminance: 2500, // 25 in XMP format
      detail: 500, // 5 in XMP format
      color: 2500, // 25 in XMP format
      colorSmoothness: 500, // 5 in XMP format
    },
    grain: {
      amount: 2000, // 20 in XMP format
      size: 2500, // 25 in XMP format
      roughness: 1500, // 15 in XMP format
    },
    colorAdjustments: {
      red: { hue: 0, saturation: 0, luminance: 0 },
      orange: { hue: 0, saturation: 0, luminance: 0 },
      yellow: { hue: 0, saturation: 0, luminance: 0 },
      green: { hue: 0, saturation: 0, luminance: 0 },
      aqua: { hue: 0, saturation: 0, luminance: 0 },
      blue: { hue: 0, saturation: 0, luminance: 0 },
      purple: { hue: 0, saturation: 0, luminance: 0 },
      magenta: { hue: 0, saturation: 0, luminance: 0 },
    },
  },
  toneCurve: {
    rgb: [
      { x: 0, y: 0 },
      { x: 64, y: 64 },
      { x: 128, y: 128 },
      { x: 192, y: 192 },
      { x: 255, y: 255 },
    ],
    red: [
      { x: 0, y: 0 },
      { x: 64, y: 64 },
      { x: 128, y: 128 },
      { x: 192, y: 192 },
      { x: 255, y: 255 },
    ],
    green: [
      { x: 0, y: 0 },
      { x: 64, y: 64 },
      { x: 128, y: 128 },
      { x: 192, y: 192 },
      { x: 255, y: 255 },
    ],
    blue: [
      { x: 0, y: 0 },
      { x: 64, y: 64 },
      { x: 128, y: 128 },
      { x: 192, y: 192 },
      { x: 255, y: 255 },
    ],
  },
  whiteBalance: "Custom",
  cameraProfile: "Adobe Standard",
  profileName: "Adobe Standard",
  version: "15.0",
  processVersion: "15.0",
  creator: "Test User",
  dateCreated: "2024-01-01T00:00:00.000Z",
};

// Test the XMP compilation
export const testXMPCompilation = () => {
  try {
    const xmpContent = compileXMP(testPreset);

    // Check if the XMP content contains expected elements
    const hasXMLHeader = xmpContent.includes(
      '<?xml version="1.0" encoding="UTF-8"?>'
    );
    const hasXMPMeta = xmpContent.includes("<x:xmpmeta");
    const hasRDF = xmpContent.includes("<rdf:RDF");
    const hasDescription = xmpContent.includes("<rdf:Description");
    const hasTitle = xmpContent.includes('crs:Title="Test Preset"');
    const hasExposure = xmpContent.includes('crs:Exposure2012="50"');
    const hasToneCurve = xmpContent.includes(
      'crs:ToneCurvePV2012="0 0, 64 64, 128 128, 192 192, 255 255"'
    );

    console.log("XMP Compilation Test Results:");
    console.log("- XML Header:", hasXMLHeader);
    console.log("- XMP Meta:", hasXMPMeta);
    console.log("- RDF:", hasRDF);
    console.log("- Description:", hasDescription);
    console.log("- Title:", hasTitle);
    console.log("- Exposure:", hasExposure);
    console.log("- Tone Curve:", hasToneCurve);

    const allTestsPassed =
      hasXMLHeader &&
      hasXMPMeta &&
      hasRDF &&
      hasDescription &&
      hasTitle &&
      hasExposure &&
      hasToneCurve;

    if (allTestsPassed) {
      console.log("✅ All XMP compilation tests passed!");
    } else {
      console.log("❌ Some XMP compilation tests failed!");
    }

    return allTestsPassed;
  } catch (error) {
    console.error("❌ XMP compilation test failed with error:", error);
    return false;
  }
};

// Run the test
if (typeof window !== "undefined") {
  // Only run in browser environment
  console.log("🧪 Testing XMP Compiler...");
  testXMPCompilation();
}
