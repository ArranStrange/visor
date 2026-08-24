/**
 * Canonical Fujifilm sensor generations for film sim compatibility.
 *
 * Film sims are tagged with the sensor generation(s) they were designed on
 * (stored in FilmSim.compatibleSensors). This file defines the selectable
 * generations and which in-camera settings each supports — so the UI can
 * distinguish "not set" from "this sensor can't do this". Camera lists are
 * derived from fujifilmCameras.ts, the camera → sensor source of truth.
 *
 * Nuances are simplified per-generation; per-camera exceptions are noted.
 */

import {
  SensorKey,
  camerasForSensor,
  sensorKeyForCamera,
} from "./fujifilmCameras";

export interface SensorFeatures {
  /** Grain Effect (introduced with X-Trans III, X-Pro2). */
  grainEffect: boolean;
  /** Grain size option (small/large) — 4th generation onward. */
  grainSize: boolean;
  /** Color Chrome Effect — 4th generation onward (also X-H1). */
  colorChromeEffect: boolean;
  /** Color Chrome FX Blue — 4th generation onward. */
  colorChromeFXBlue: boolean;
  /** Clarity — 4th generation onward (not X-T3/X-T30). */
  clarity: boolean;
  /** Classic Negative film simulation — 4th generation onward. */
  classicNegative: boolean;
  /** Nostalgic Negative film simulation — 5th generation / GFX 100S onward. */
  nostalgicNegative: boolean;
  /** Reala Ace film simulation — X100VI / GFX100 II era onward. */
  realaAce: boolean;
}

export interface FujifilmSensor {
  /** Stable slug used in URLs, e.g. /search?sensor=x-trans-iii */
  key: SensorKey;
  /** Display label; matches the value stored on film sims. */
  label: string;
  cameras: string[];
  features: SensorFeatures;
  notes?: string;
}

export const FUJIFILM_SENSORS: FujifilmSensor[] = [
  {
    key: "x-trans-i",
    cameras: camerasForSensor("x-trans-i"),
    label: "X-Trans I",
    features: {
      grainEffect: false,
      grainSize: false,
      colorChromeEffect: false,
      colorChromeFXBlue: false,
      clarity: false,
      classicNegative: false,
      nostalgicNegative: false,
      realaAce: false,
    },
  },
  {
    key: "x-trans-ii",
    cameras: camerasForSensor("x-trans-ii"),
    label: "X-Trans II",
    features: {
      grainEffect: false,
      grainSize: false,
      colorChromeEffect: false,
      colorChromeFXBlue: false,
      clarity: false,
      classicNegative: false,
      nostalgicNegative: false,
      realaAce: false,
    },
  },
  {
    key: "x-trans-iii",
    cameras: camerasForSensor("x-trans-iii"),
    label: "X-Trans III",
    features: {
      grainEffect: true,
      grainSize: false,
      colorChromeEffect: false, // exception: X-H1 has Color Chrome Effect
      colorChromeFXBlue: false,
      clarity: false,
      classicNegative: false,
      nostalgicNegative: false,
      realaAce: false,
    },
    notes: "X-H1 additionally supports Eterna and Color Chrome Effect.",
  },
  {
    key: "x-trans-iv",
    cameras: camerasForSensor("x-trans-iv"),
    label: "X-Trans IV",
    features: {
      grainEffect: true,
      grainSize: true,
      colorChromeEffect: true,
      colorChromeFXBlue: true,
      clarity: true, // exception: X-T3/X-T30 lack Clarity
      classicNegative: true,
      nostalgicNegative: false,
      realaAce: false,
    },
    notes:
      "X-S20 and X-M5 pair this sensor with the newer X-Processor 5, so they also run most 5th-generation film sims. X-T3/X-T30 lack Clarity and Classic Negative arrived there via firmware.",
  },
  {
    key: "x-trans-v",
    cameras: camerasForSensor("x-trans-v"),
    label: "X-Trans V",
    features: {
      grainEffect: true,
      grainSize: true,
      colorChromeEffect: true,
      colorChromeFXBlue: true,
      clarity: true,
      classicNegative: true,
      nostalgicNegative: true,
      realaAce: true, // Reala Ace shipped with X100VI; earlier gen-5 bodies vary by firmware
    },
    notes: "Covers both X-Trans V HR (40MP) and X-Trans V HS (X-H2S).",
  },
  {
    key: "bayer",
    cameras: camerasForSensor("bayer"),
    label: "Bayer",
    features: {
      grainEffect: false,
      grainSize: false,
      colorChromeEffect: false,
      colorChromeFXBlue: false,
      clarity: false,
      classicNegative: false,
      nostalgicNegative: false,
      realaAce: false,
    },
    notes: "Entry-level X bodies with conventional Bayer sensors.",
  },
  {
    key: "gfx",
    cameras: camerasForSensor("gfx"),
    label: "GFX",
    features: {
      grainEffect: true,
      grainSize: true,
      colorChromeEffect: true,
      colorChromeFXBlue: true,
      clarity: true,
      classicNegative: true,
      nostalgicNegative: true, // GFX 100S onward
      realaAce: true, // GFX 100 II onward
    },
    notes:
      "Medium format line; feature availability varies by body — 50-series models support fewer film sims than the 100-series.",
  },
];

export const getSensorByLabel = (label: string): FujifilmSensor | undefined =>
  FUJIFILM_SENSORS.find(
    (s) => s.label.toLowerCase() === label.trim().toLowerCase()
  );

export const getSensorByKey = (key: string): FujifilmSensor | undefined =>
  FUJIFILM_SENSORS.find((s) => s.key === key);

export const SENSOR_LABELS = FUJIFILM_SENSORS.map((s) => s.label);

/**
 * Look up the sensor generation for a camera by name. Tolerant of the
 * free-text names users put on their profiles ("Fujifilm X-E2", "fuji x100f").
 */
export const getSensorForCamera = (
  cameraName: string
): FujifilmSensor | undefined => {
  const key = sensorKeyForCamera(cameraName);
  return key ? getSensorByKey(key) : undefined;
};

/** The subset of recipe settings relevant to sensor compatibility checks. */
export interface RecipeCompatibilitySettings {
  clarity?: number | null;
  grainEffect?: string | null;
  colorChromeEffect?: string | null;
  colorChromeFxBlue?: string | null;
  filmSimulation?: string | null;
}

/**
 * Warn when a recipe uses settings a selected sensor generation doesn't
 * support (e.g. Clarity on X-Trans III). Returns one message per affected
 * sensor; empty array when everything is compatible.
 */
export const getSensorCompatibilityWarnings = (
  sensorLabels: string[],
  settings: RecipeCompatibilitySettings
): string[] => {
  const warnings: string[] = [];

  for (const label of sensorLabels) {
    const sensor = getSensorByLabel(label);
    if (!sensor) continue;

    const f = sensor.features;
    const unsupported: string[] = [];

    if (settings.clarity && !f.clarity) unsupported.push("Clarity");
    if (
      settings.grainEffect &&
      settings.grainEffect !== "OFF" &&
      !f.grainEffect
    )
      unsupported.push("Grain Effect");
    if (
      settings.colorChromeEffect &&
      settings.colorChromeEffect !== "OFF" &&
      !f.colorChromeEffect
    )
      unsupported.push("Color Chrome Effect");
    if (
      settings.colorChromeFxBlue &&
      settings.colorChromeFxBlue !== "OFF" &&
      !f.colorChromeFXBlue
    )
      unsupported.push("Color Chrome FX Blue");

    const sim = (settings.filmSimulation || "").toUpperCase();
    if (/CLASSIC[_\s-]?NEG/.test(sim) && !f.classicNegative)
      unsupported.push("Classic Negative");
    if (/NOSTALGIC/.test(sim) && !f.nostalgicNegative)
      unsupported.push("Nostalgic Negative");
    if (/REALA/.test(sim) && !f.realaAce) unsupported.push("Reala Ace");

    if (unsupported.length) {
      warnings.push(`${label} doesn't support: ${unsupported.join(", ")}`);
    }
  }

  return warnings;
};
