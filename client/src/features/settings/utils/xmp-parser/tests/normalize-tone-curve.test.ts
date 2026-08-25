import { describe, expect, it } from "vitest";
import { normalizeToneCurve } from "@/features/settings/utils/xmp-parser/index";

describe("normalizeToneCurve", () => {
  it("samples curve output at the five chart input points", () => {
    expect(
      normalizeToneCurve(
        [
          { x: 0, y: 0 },
          { x: 128, y: 64 },
          { x: 255, y: 255 },
        ],
        "sampled"
      )
    ).toEqual([0, 32, 64, 160, 255]);
  });

  it("keeps identity values where a chart input cannot be interpolated", () => {
    expect(
      normalizeToneCurve(
        [
          { x: 64, y: 20 },
          { x: 192, y: 220 },
        ],
        "sampled"
      )
    ).toEqual([0, 20, 120, 220, 255]);
    expect(normalizeToneCurve(undefined, "sampled")).toEqual([
      0, 64, 128, 192, 255,
    ]);
  });

  it("clones point data for XMP output", () => {
    const curve = [
      { x: 0, y: 10 },
      { x: 255, y: 245 },
    ];

    const normalized = normalizeToneCurve(curve, "points");

    expect(normalized).toEqual(curve);
    expect(normalized).not.toBe(curve);
    expect(normalized?.[0]).not.toBe(curve[0]);
  });

  it("returns no XMP point data for a missing curve", () => {
    expect(normalizeToneCurve(undefined, "points")).toBeUndefined();
    expect(normalizeToneCurve(null, "points")).toBeUndefined();
  });
});
