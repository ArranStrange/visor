import { describe, it, expect } from "vitest";
import {
  getCompatibilityVerdict,
  resolveCameraCapabilities,
} from "@/features/compatibility";
import { getSensorCompatibilityWarnings } from "@/features/film-sims/utils/fujifilmSensors";
import type { RecipeCompatibilitySettings } from "@/features/compatibility";

// A recipe that uses only settings every generation has.
const plainRecipe: RecipeCompatibilitySettings = {
  filmSimulation: "CLASSIC CHROME",
  highlight: 1,
} as RecipeCompatibilitySettings;

const modernRecipe: RecipeCompatibilitySettings = {
  filmSimulation: "CLASSIC CHROME",
  clarity: -3,
  grainEffect: "Weak",
  colorChromeEffect: "Strong",
  colorChromeFxBlue: "Weak",
};

describe("resolveCameraCapabilities", () => {
  it("applies the per-body feature exceptions over the generation matrix", () => {
    // Gen-4 has Clarity, but the X-T3 does not.
    expect(resolveCameraCapabilities("X-T4").features?.clarity).toBe(true);
    expect(resolveCameraCapabilities("X-T3").features?.clarity).toBe(false);
    // Gen-3 has no Color Chrome Effect, but the X-H1 does.
    expect(resolveCameraCapabilities("X-T2").features?.colorChromeEffect).toBe(
      false
    );
    expect(resolveCameraCapabilities("X-H1").features?.colorChromeEffect).toBe(
      true
    );
  });

  it("applies the per-body film simulation exceptions", () => {
    expect(resolveCameraCapabilities("X-T3").features?.nostalgicNegative).toBe(
      false
    );
    // Gen-4 sensor, X-Processor 5: has Nostalgic Negative.
    expect(resolveCameraCapabilities("X-S20").features?.nostalgicNegative).toBe(
      true
    );
  });

  it("tolerates any user-written form of the name", () => {
    for (const written of ["X-T30 II", "fuji xt30ii", "Fujifilm X-T30II"]) {
      expect(resolveCameraCapabilities(written).camera?.name).toBe("X-T30 II");
      expect(resolveCameraCapabilities(written).features?.clarity).toBe(false);
    }
  });

  it("returns no features at all for a body it doesn't know", () => {
    expect(resolveCameraCapabilities("Nikon Z6").features).toBeUndefined();
    expect(resolveCameraCapabilities("").features).toBeUndefined();
    expect(resolveCameraCapabilities(null).features).toBeUndefined();
  });
});

describe("getCompatibilityVerdict", () => {
  it("FITS when every setting applies and the recipe names this generation", () => {
    const verdict = getCompatibilityVerdict("X-T5", {
      settings: modernRecipe,
      compatibleSensors: ["X-Trans V"],
    });

    expect(verdict.status).toBe("FITS");
    expect(verdict.reasons).toEqual([]);
    expect(verdict.lost).toEqual([]);
    expect(verdict.missingFilmSimulation).toBeNull();
  });

  it("FITS when the recipe names no generation at all", () => {
    // No declared sensors is not a claim that other bodies are wrong.
    expect(
      getCompatibilityVerdict("X-T5", { settings: modernRecipe }).status
    ).toBe("FITS");
    expect(
      getCompatibilityVerdict("X-T5", {
        settings: modernRecipe,
        compatibleSensors: [],
      }).status
    ).toBe("FITS");
  });

  it("FITS_WITH_SUBSTITUTIONS when nothing is lost but it was written elsewhere", () => {
    const verdict = getCompatibilityVerdict("X-T5", {
      settings: modernRecipe,
      compatibleSensors: ["GFX"],
    });

    expect(verdict.status).toBe("FITS_WITH_SUBSTITUTIONS");
    expect(verdict.lost).toEqual([]);
    expect(verdict.reasons[0]).toMatch(/written for GFX/);
  });

  it("PARTIAL when the film sim is available but settings are not", () => {
    // X-Trans III: no Clarity, no Color Chrome Effect, no FX Blue.
    const verdict = getCompatibilityVerdict("X-T2", {
      settings: modernRecipe,
      compatibleSensors: ["X-Trans III"],
    });

    expect(verdict.status).toBe("PARTIAL");
    expect(verdict.lost).toEqual([
      "Clarity",
      "Color Chrome Effect",
      "Color Chrome FX Blue",
    ]);
    expect(verdict.missingFilmSimulation).toBeNull();
    expect(verdict.reasons).toHaveLength(3);
  });

  it("PARTIAL respects per-body exceptions rather than the generation alone", () => {
    // The X-H1 is gen-3 but does have Color Chrome Effect, so only Clarity
    // and FX Blue are lost.
    const verdict = getCompatibilityVerdict("X-H1", { settings: modernRecipe });

    expect(verdict.status).toBe("PARTIAL");
    expect(verdict.lost).toEqual(["Clarity", "Color Chrome FX Blue"]);
  });

  it("INCOMPATIBLE when the body can't render the recipe's film simulation", () => {
    const verdict = getCompatibilityVerdict("X-T2", {
      settings: { filmSimulation: "CLASSIC NEG" },
    });

    expect(verdict.status).toBe("INCOMPATIBLE");
    expect(verdict.missingFilmSimulation).toBe("Classic Negative");
    expect(verdict.reasons[0]).toMatch(/X-T2 doesn't have Classic Negative/);
  });

  it("INCOMPATIBLE outranks lost settings and still lists them", () => {
    const verdict = getCompatibilityVerdict("X-T2", {
      settings: { ...modernRecipe, filmSimulation: "Nostalgic Neg" },
    });

    expect(verdict.status).toBe("INCOMPATIBLE");
    expect(verdict.missingFilmSimulation).toBe("Nostalgic Negative");
    expect(verdict.lost).toContain("Clarity");
    expect(verdict.reasons.length).toBeGreaterThan(1);
  });

  it("a gated sim the body does have is not a problem", () => {
    expect(
      getCompatibilityVerdict("X-S20", {
        settings: { filmSimulation: "NOSTALGIC NEG" },
      }).status
    ).toBe("FITS");
  });

  it("UNVERIFIED when no camera is set", () => {
    const verdict = getCompatibilityVerdict(null, { settings: modernRecipe });

    expect(verdict.status).toBe("UNVERIFIED");
    expect(verdict.reasons[0]).toMatch(/Set your camera/);
    expect(verdict.lost).toEqual([]);
  });

  it("UNVERIFIED — never guessed — for a body outside the catalogue", () => {
    const verdict = getCompatibilityVerdict("Nikon Z6", {
      settings: modernRecipe,
      compatibleSensors: ["X-Trans V"],
    });

    expect(verdict.status).toBe("UNVERIFIED");
    expect(verdict.reasons[0]).toMatch(/isn't in the camera catalogue/);
  });

  it("an empty recipe on a known body FITS rather than erroring", () => {
    expect(getCompatibilityVerdict("X-T5", {}).status).toBe("FITS");
    expect(getCompatibilityVerdict("X-T5", { settings: null }).status).toBe(
      "FITS"
    );
  });

  it("an OFF effect isn't a setting the body needs to support", () => {
    // A recipe that switches grain off asks nothing of a body without grain.
    const verdict = getCompatibilityVerdict("X-T1", {
      settings: { ...plainRecipe, grainEffect: "OFF", clarity: 0 },
    });

    expect(verdict.status).toBe("FITS");
  });
});

describe("getSensorCompatibilityWarnings (adapter)", () => {
  it("keeps its one-message-per-sensor string contract", () => {
    expect(
      getSensorCompatibilityWarnings(["X-Trans III", "X-Trans V"], modernRecipe)
    ).toEqual([
      "X-Trans III doesn't support: Clarity, Color Chrome Effect, Color Chrome FX Blue",
    ]);
  });

  it("lists a missing film simulation after the missing settings", () => {
    expect(
      getSensorCompatibilityWarnings(["X-Trans III"], {
        ...modernRecipe,
        filmSimulation: "CLASSIC NEG",
      })
    ).toEqual([
      "X-Trans III doesn't support: Clarity, Color Chrome Effect, Color Chrome FX Blue, Classic Negative",
    ]);
  });

  it("ignores sensor labels it doesn't recognise", () => {
    expect(getSensorCompatibilityWarnings(["Foveon"], modernRecipe)).toEqual(
      []
    );
  });

  it("answers about the generation, not a body — no per-camera exceptions", () => {
    // The X-H1 exception must not leak into a question about X-Trans III.
    expect(
      getSensorCompatibilityWarnings(["X-Trans III"], {
        colorChromeEffect: "Strong",
      })
    ).toEqual(["X-Trans III doesn't support: Color Chrome Effect"]);
  });
});
