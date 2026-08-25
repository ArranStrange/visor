// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { parseXmpContent } from "@/features/settings/utils/settingsParser";
import { compileXMP } from "@/features/presets/utils/xmp-compiler";

describe("XMP compile and parse", () => {
  it("preserves scalar, color, and metadata fields through a round trip", () => {
    const xmp = compileXMP({
      title: "Characterization preset",
      description: "Round-trip fixture",
      creator: "VISOR tests",
      dateCreated: "2026-08-24T10:00:00.000Z",
      version: "15.0",
      processVersion: "15.0",
      whiteBalance: "Custom",
      cameraProfile: "Adobe Standard",
      profileName: "Test profile",
      settings: {
        exposure: 125,
        contrast: -40,
        temp: 5500,
        tint: 700,
        colorAdjustments: {
          red: { hue: 20, saturation: -30, luminance: 40 },
        },
      },
      toneCurve: {
        rgb: [
          { x: 0, y: 0 },
          { x: 128, y: 132 },
          { x: 255, y: 255 },
        ],
      },
    });

    const parsed = parseXmpContent(xmp);

    expect(parsed).toMatchObject({
      version: "15.0",
      processVersion: "15.0",
      whiteBalance: "Custom",
      cameraProfile: "Adobe Standard",
      profileName: "Test profile",
      exposure: 125,
      contrast: -40,
      temp: 5500,
      tint: 700,
      colorAdjustments: {
        red: { hue: 20, saturation: -30, luminance: 40 },
      },
      metadata: {
        title: "Characterization preset",
        creator: "VISOR tests",
        dateCreated: "2026-08-24T10:00:00.000Z",
      },
      settings: {
        exposure: 125,
        contrast: -40,
        temp: 5500,
        tint: 700,
        colorAdjustments: {
          red: { hue: 20, saturation: -30, luminance: 40 },
        },
      },
    });
    expect(parsed.toneCurveName).toBe("Custom");
    expect(parsed.toneCurve).toEqual({
      rgb: [],
      red: [],
      green: [],
      blue: [],
    });
  });
});
