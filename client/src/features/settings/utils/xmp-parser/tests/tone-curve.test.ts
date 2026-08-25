import { describe, expect, it } from "vitest";
import { parseToneCurve } from "@/features/settings/utils/xmp-parser/tone-curve";

describe("parseToneCurve", () => {
  it("returns no points for empty curve data", () => {
    expect(parseToneCurve("")).toEqual([]);
  });

  it("returns no points for missing curve data", () => {
    const missingCurve: string | undefined = undefined;

    expect(parseToneCurve(missingCurve!)).toEqual([]);
  });
});
