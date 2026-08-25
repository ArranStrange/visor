import type { RecipeCompatibilitySettings, SensorFeatures } from "./types";

/**
 * Which recipe settings a given feature matrix can and cannot apply.
 *
 * Deliberately depends on nothing but its arguments: the sensor catalogue
 * imports this module, so it must not import the catalogue back.
 */

/** Film simulations gated by sensor generation. */
export const SIM_GATES: {
  pattern: RegExp;
  feature: "classicNegative" | "nostalgicNegative" | "realaAce";
  label: string;
}[] = [
  {
    pattern: /CLASSIC[_\s-]?NEG/i,
    feature: "classicNegative",
    label: "Classic Negative",
  },
  {
    pattern: /NOSTALGIC/i,
    feature: "nostalgicNegative",
    label: "Nostalgic Negative",
  },
  { pattern: /REALA/i, feature: "realaAce", label: "Reala Ace" },
];

/** An effect setting counts as "used" only when it's present and not OFF. */
const isEffectOn = (value: string | null | undefined) =>
  Boolean(value) && value !== "OFF";

/**
 * Display labels of the non-film-simulation settings this feature matrix
 * can't apply. Order is stable — it is the order the warning strings have
 * always used.
 */
export const findUnsupportedSettings = (
  features: SensorFeatures,
  settings: RecipeCompatibilitySettings
): string[] => {
  const unsupported: string[] = [];

  if (settings.clarity && !features.clarity) unsupported.push("Clarity");
  if (isEffectOn(settings.grainEffect) && !features.grainEffect)
    unsupported.push("Grain Effect");
  if (isEffectOn(settings.colorChromeEffect) && !features.colorChromeEffect)
    unsupported.push("Color Chrome Effect");
  if (isEffectOn(settings.colorChromeFxBlue) && !features.colorChromeFXBlue)
    unsupported.push("Color Chrome FX Blue");

  return unsupported;
};

/**
 * Display label of the recipe's film simulation when this feature matrix
 * can't render it, otherwise null. Ungated simulations (Provia, Classic
 * Chrome, Acros…) are available everywhere and always return null.
 */
export const findMissingFilmSimulation = (
  features: SensorFeatures,
  filmSimulation: string | null | undefined
): string | null => {
  if (!filmSimulation) return null;
  const gate = SIM_GATES.find((candidate) =>
    candidate.pattern.test(filmSimulation)
  );
  if (!gate || features[gate.feature]) return null;
  return gate.label;
};

/** Everything a feature matrix can't do with this recipe, in warning order. */
export const findAllUnsupported = (
  features: SensorFeatures,
  settings: RecipeCompatibilitySettings
): string[] => {
  const missingSim = findMissingFilmSimulation(
    features,
    settings.filmSimulation
  );
  const unsupported = findUnsupportedSettings(features, settings);
  return missingSim ? [...unsupported, missingSim] : unsupported;
};
