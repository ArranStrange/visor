import { describe, it, expect } from "vitest";
import {
  buildDialInSteps,
  formatStepValue,
  formatSigned,
} from "@/features/loadouts/utils/dialIn";
import {
  DIAL_IN_STEP_ORDER,
  MENU_PATHS,
  SETTING_DEFAULTS,
  CAMERA_FEATURE_OVERRIDES,
  CAMERA_SIM_OVERRIDES,
} from "@/features/loadouts/constants/menuPaths";
import { normalizeCameraName, findCamera } from "@/constants/fujifilmCameras";
import { FUJIFILM_SENSORS } from "@/features/film-sims/utils/fujifilmSensors";
import type { FilmSimSettings } from "@/features/film-sims/types/filmSim";

const fullRecipe: Partial<FilmSimSettings> = {
  filmSimulation: "CLASSIC CHROME",
  grainEffect: "Weak",
  colorChromeEffect: "Strong",
  colorChromeFxBlue: "Weak",
  whiteBalance: "daylight",
  wbShift: { r: 3, b: -2 },
  dynamicRange: 400,
  highlight: -1,
  shadow: 2,
  color: 0,
  sharpness: -2,
  noiseReduction: -4,
  clarity: -3,
};

describe("buildDialInSteps", () => {
  it("starts every flow with the enter-bank step (edit-in-bank workflow)", () => {
    const plan = buildDialInSteps(fullRecipe, "xt5", 4);
    expect(plan.steps[0].key).toBe("enterBank");
    expect(plan.steps[0].value).toBe("C4");
    expect(plan.steps[0].path).toEqual([
      "IQ MENU",
      "EDIT/SAVE CUSTOM SETTING",
      "C4",
    ]);
  });

  it("renders all 12 settings for a full recipe on a gen-5 body", () => {
    const plan = buildDialInSteps(fullRecipe, "xt5", 1);
    expect(plan.steps).toHaveLength(13); // enterBank + 12
    expect(plan.skipped).toEqual([]);
    expect(plan.caveat).toBeNull();
  });

  it("never skips explicitly-zero values, and reminds why", () => {
    const plan = buildDialInSteps(fullRecipe, "xt5", 1);
    const color = plan.steps.find((s) => s.key === "color");
    expect(color?.value).toBe("0");
    expect(color?.hint).toMatch(/bank remembers/);
  });

  it("unspecified settings become explicit set-to-default steps", () => {
    const plan = buildDialInSteps({ filmSimulation: "PROVIA" }, "xt5", 1);
    const clarity = plan.steps.find((s) => s.key === "clarity");
    expect(clarity?.value).toBe("0");
    expect(clarity?.hint).toMatch(/factory default/);
    const dr = plan.steps.find((s) => s.key === "dynamicRange");
    expect(dr?.value).toBe("DR100");
  });

  it("skips settings the sensor generation lacks, and reports them", () => {
    // X-E2 is x-trans-ii: no grain, no CCE, no CCFXB, no clarity.
    const plan = buildDialInSteps(fullRecipe, "xe2", 1);
    const keys = plan.steps.map((s) => s.key);
    expect(keys).not.toContain("grainEffect");
    expect(keys).not.toContain("clarity");
    expect(plan.skipped.map((s) => s.key)).toEqual([
      "grainEffect",
      "colorChromeEffect",
      "colorChromeFxBlue",
      "clarity",
    ]);
  });

  it("applies per-camera exceptions: X-T3 has no Clarity despite gen-4 sensor", () => {
    const plan = buildDialInSteps(fullRecipe, "xt3", 1);
    expect(plan.steps.map((s) => s.key)).not.toContain("clarity");
    expect(plan.skipped.map((s) => s.key)).toContain("clarity");
    // ...but a plain X-T4 keeps it.
    const xt4 = buildDialInSteps(fullRecipe, "xt4", 1);
    expect(xt4.steps.map((s) => s.key)).toContain("clarity");
  });

  it("applies per-camera exceptions: X-H1 gains Color Chrome Effect despite gen-3 sensor", () => {
    const xh1 = buildDialInSteps(fullRecipe, "xh1", 1);
    expect(xh1.steps.map((s) => s.key)).toContain("colorChromeEffect");
    // A plain gen-3 body doesn't have it.
    const xt2 = buildDialInSteps(fullRecipe, "xt2", 1);
    expect(xt2.steps.map((s) => s.key)).not.toContain("colorChromeEffect");
  });

  it("an unsupported film simulation becomes a warning step, never a skip", () => {
    const plan = buildDialInSteps(
      { ...fullRecipe, filmSimulation: "CLASSIC NEG" },
      "xt2",
      1
    );
    const sim = plan.steps.find((s) => s.key === "filmSimulation");
    expect(sim).toBeDefined();
    expect(sim?.warning).toMatch(/Classic Negative/);
  });

  it("unknown camera: shows every step, caveats the flow, verifies nothing", () => {
    const plan = buildDialInSteps(fullRecipe, "notacamera", 1);
    expect(plan.caveat).toMatch(/isn't in the catalog/);
    expect(plan.skipped).toEqual([]);
    // Step 0 orients the whole edit-in-bank workflow, so it degrades to
    // value-only guidance too — a wrong path is worst there.
    expect(plan.steps[0].path).toBeNull();
    expect(plan.steps[0].hint).toMatch(/EDIT\/SAVE CUSTOM SETTING/);
    expect(plan.steps[1].path).toBeNull();
  });

  it("unknown camera: gated film simulations never warn (nothing to check against)", () => {
    const plan = buildDialInSteps(
      { ...fullRecipe, filmSimulation: "NOSTALGIC NEG" },
      "notacamera",
      1
    );
    expect(plan.steps.find((s) => s.key === "filmSimulation")?.warning).toBeUndefined();
  });

  it("gen-3 bodies get the separate tone-item path overrides", () => {
    const plan = buildDialInSteps(fullRecipe, "xt2", 1);
    expect(plan.steps.find((s) => s.key === "highlight")?.path).toEqual([
      "HIGHLIGHT TONE",
    ]);
    expect(plan.steps.find((s) => s.key === "shadow")?.path).toEqual([
      "SHADOW TONE",
    ]);
    // Gen 4 uses the combined TONE CURVE screen.
    const xt4 = buildDialInSteps(fullRecipe, "xt4", 1);
    expect(xt4.steps.find((s) => s.key === "highlight")?.path).toEqual([
      "TONE CURVE",
      "HIGHLIGHT",
    ]);
  });

  it("camera overrides resolve for display-form names, not just stored keys", () => {
    // The wallet passes normalized cameraKey, but the override tables must
    // tolerate any form findCamera tolerates.
    const plan = buildDialInSteps(fullRecipe, "Fujifilm X-T30 II", 1);
    expect(plan.steps.map((s) => s.key)).not.toContain("clarity");
  });

  it("per-camera sim overrides: X-S20 runs Nostalgic Neg despite gen-4 sensor", () => {
    const xs20 = buildDialInSteps(
      { ...fullRecipe, filmSimulation: "NOSTALGIC NEG" },
      "xs20",
      1
    );
    expect(
      xs20.steps.find((s) => s.key === "filmSimulation")?.warning
    ).toBeUndefined();
    // A plain X-T4 still warns.
    const xt4 = buildDialInSteps(
      { ...fullRecipe, filmSimulation: "NOSTALGIC NEG" },
      "xt4",
      1
    );
    expect(xt4.steps.find((s) => s.key === "filmSimulation")?.warning).toMatch(
      /Nostalgic Negative/
    );
  });

  it("a shift-only recipe still gets a WB step, with set-the-mode guidance", () => {
    const plan = buildDialInSteps({ wbShift: { r: 2, b: -1 } }, "xt5", 1);
    const wb = plan.steps.find((s) => s.key === "whiteBalance");
    expect(wb?.value).toBe("Auto · R+2 B-1");
    expect(wb?.hint).toMatch(/doesn't specify the WB mode/);
  });

  it("an explicitly zero WB shift gets the zero reminder", () => {
    const plan = buildDialInSteps(
      { whiteBalance: "daylight", wbShift: { r: 0, b: 0 } },
      "xt5",
      1
    );
    expect(plan.steps.find((s) => s.key === "whiteBalance")?.hint).toMatch(
      /bank remembers/
    );
  });

  it("a non-zero WB shift gets no zero reminder", () => {
    const plan = buildDialInSteps(fullRecipe, "xt5", 1);
    expect(plan.steps.find((s) => s.key === "whiteBalance")?.hint).toBeUndefined();
  });

  it("mixed-case OFF values still count as zeroish", () => {
    const plan = buildDialInSteps(
      { ...fullRecipe, grainEffect: "Off" },
      "xt5",
      1
    );
    expect(plan.steps.find((s) => s.key === "grainEffect")?.hint).toMatch(
      /bank remembers/
    );
  });

  it("bodies outside the transcribed generations get value-only guidance", () => {
    // GFX 100S: catalog body, but paths aren't transcribed for gfx.
    const plan = buildDialInSteps(fullRecipe, "gfx100s", 1);
    const sim = plan.steps.find((s) => s.key === "filmSimulation");
    expect(sim?.path).toBeNull();
    expect(sim?.value).toBe("CLASSIC CHROME");
  });

  it("DR200/DR400 steps carry their ISO floor", () => {
    const plan = buildDialInSteps(fullRecipe, "xt5", 1);
    expect(plan.steps.find((s) => s.key === "dynamicRange")?.hint).toMatch(
      /ISO 640/
    );
  });

  it("WB and shift form one combined step", () => {
    const plan = buildDialInSteps(fullRecipe, "xt5", 1);
    const wb = plan.steps.find((s) => s.key === "whiteBalance");
    expect(wb?.value).toBe("Daylight · R+3 B-2");
    expect(plan.steps.filter((s) => /white/i.test(s.label))).toHaveLength(1);
  });
});

describe("path table completeness (drift guard)", () => {
  it("every step key resolves a path or explicit value-only mode for every sensor", () => {
    for (const sensor of FUJIFILM_SENSORS) {
      for (const key of DIAL_IN_STEP_ORDER) {
        const entry = MENU_PATHS[key];
        expect(entry, `${key} missing from MENU_PATHS`).toBeDefined();
        expect(entry.path.length).toBeGreaterThan(0);
        expect(entry.source.length).toBeGreaterThan(0);
        const override = entry.overrides?.[sensor.key];
        if (override) expect(override.length).toBeGreaterThan(0);
      }
    }
  });

  it("every step key has a factory default", () => {
    for (const key of DIAL_IN_STEP_ORDER) {
      expect(SETTING_DEFAULTS[key], `${key} missing default`).toBeDefined();
    }
  });

  it("override-table keys are normalized and resolve to catalog bodies", () => {
    for (const table of [CAMERA_FEATURE_OVERRIDES, CAMERA_SIM_OVERRIDES]) {
      for (const key of Object.keys(table)) {
        expect(normalizeCameraName(key), `${key} is not normalized`).toBe(key);
        expect(findCamera(key), `${key} not in the camera catalog`).toBeDefined();
      }
    }
  });
});

describe("formatters", () => {
  it("formats signed integers the way the camera displays them", () => {
    expect(formatSigned(2)).toBe("+2");
    expect(formatSigned(-1)).toBe("-1");
    expect(formatSigned(0)).toBe("0");
  });

  it("formats DR values and defaults", () => {
    expect(formatStepValue("dynamicRange", { dynamicRange: 200 })).toBe("DR200");
    expect(formatStepValue("dynamicRange", {})).toBe("DR100");
  });

  it("formats WB with shift, defaulting missing parts", () => {
    expect(formatStepValue("whiteBalance", { whiteBalance: "auto" })).toBe(
      "Auto · R0 B0"
    );
  });

  it("uppercases toggle-style values", () => {
    expect(formatStepValue("grainEffect", { grainEffect: "Weak" })).toBe("WEAK");
    expect(formatStepValue("grainEffect", {})).toBe("OFF");
  });
});
