import type { SensorKey } from "@/constants/fujifilmCameras";
import type { FilmSimSettings } from "@/features/film-sims/types/filmSim";

/**
 * Menu-path data for dial-in mode.
 *
 * Workflow: EDIT-IN-BANK. Every path below is relative to the bank
 * submenu the user opens once at step 0:
 *
 *   IQ MENU › EDIT/SAVE CUSTOM SETTING › C{n}
 *
 * Programming settings through the live shooting menus and forgetting the
 * final save leaves the bank unchanged — editing inside the bank makes
 * every subsequent step land where the user thinks it does, and makes
 * chaining coherent (back out one level, select the next bank).
 *
 * Path text is transcribed for the gen 3–5 X-mount IQ menus (verification
 * against two owner's manuals per generation is tracked in #100). Bodies
 * outside `verified` render value-only guidance — a wrong "verified" path
 * is worse than none.
 */

/** The steps dial-in can render, in physical gen-4/5 IQ menu order. */
export const DIAL_IN_STEP_ORDER = [
  "filmSimulation",
  "grainEffect",
  "colorChromeEffect",
  "colorChromeFxBlue",
  "whiteBalance",
  "dynamicRange",
  "highlight",
  "shadow",
  "color",
  "sharpness",
  "noiseReduction",
  "clarity",
] as const;

export type DialInStepKey = (typeof DIAL_IN_STEP_ORDER)[number];

export interface MenuPath {
  /** Relative to the open bank submenu. */
  path: string[];
  /** Sensor generations this path text is transcribed for. */
  verified: SensorKey[];
  /** Per-generation path replacements (e.g. gen-3 tone items). */
  overrides?: Partial<Record<SensorKey, string[]>>;
  /** Where the path text comes from — keeps "verified" reproducible. */
  source: string;
}

const GEN_345: SensorKey[] = ["x-trans-iii", "x-trans-iv", "x-trans-v"];
const MANUALS = "X-T2 / X-T4 / X-T5 owner's manuals, IQ menu";

export const MENU_PATHS: Record<DialInStepKey, MenuPath> = {
  filmSimulation: { path: ["FILM SIMULATION"], verified: GEN_345, source: MANUALS },
  grainEffect: { path: ["GRAIN EFFECT"], verified: GEN_345, source: MANUALS },
  colorChromeEffect: {
    path: ["COLOR CHROME EFFECT"],
    verified: GEN_345,
    source: MANUALS,
  },
  colorChromeFxBlue: {
    path: ["COLOR CHROME FX BLUE"],
    verified: ["x-trans-iv", "x-trans-v"],
    source: MANUALS,
  },
  whiteBalance: { path: ["WHITE BALANCE"], verified: GEN_345, source: MANUALS },
  dynamicRange: { path: ["DYNAMIC RANGE"], verified: GEN_345, source: MANUALS },
  // Gen 4/5 combine highlight/shadow under TONE CURVE; gen 3 has separate
  // top-level items.
  highlight: {
    path: ["TONE CURVE", "HIGHLIGHT"],
    verified: GEN_345,
    overrides: { "x-trans-iii": ["HIGHLIGHT TONE"] },
    source: MANUALS,
  },
  shadow: {
    path: ["TONE CURVE", "SHADOW"],
    verified: GEN_345,
    overrides: { "x-trans-iii": ["SHADOW TONE"] },
    source: MANUALS,
  },
  color: { path: ["COLOR"], verified: GEN_345, source: MANUALS },
  sharpness: { path: ["SHARPNESS"], verified: GEN_345, source: MANUALS },
  noiseReduction: { path: ["HIGH ISO NR"], verified: GEN_345, source: MANUALS },
  clarity: {
    path: ["CLARITY"],
    verified: ["x-trans-iv", "x-trans-v"],
    source: MANUALS,
  },
};

/** The path for step 0 — opening the bank submenu everything else is
 *  relative to. {bank} is replaced with C1..Cn. */
export const ENTER_BANK_PATH = ["IQ MENU", "EDIT/SAVE CUSTOM SETTING", "{bank}"];

/** Generations the enter-bank path text is transcribed for. Step 0 orients
 *  the whole edit-in-bank workflow, so a wrong path here is worse than
 *  anywhere else — other bodies get value-only guidance. */
export const ENTER_BANK_VERIFIED: SensorKey[] = GEN_345;

/**
 * Factory defaults, used when a recipe doesn't specify a setting. A bank
 * keeps whatever it previously held, so an unspecified setting is still an
 * instruction: set the default so the bank holds no leftovers.
 */
export const SETTING_DEFAULTS: Pick<FilmSimSettings, DialInStepKey> = {
  filmSimulation: "PROVIA",
  grainEffect: "OFF",
  colorChromeEffect: "OFF",
  colorChromeFxBlue: "OFF",
  whiteBalance: "auto",
  dynamicRange: 100,
  highlight: 0,
  shadow: 0,
  color: 0,
  sharpness: 0,
  noiseReduction: 0,
  clarity: 0,
};

/**
 * Per-camera feature exceptions the per-generation SensorFeatures matrix
 * can't express. Keyed by cameraKey (normalized). The prose notes in
 * fujifilmSensors.ts already document these; dial-in needs them
 * machine-readable so X-T3 owners aren't told to set Clarity their body
 * doesn't have.
 */
export const CAMERA_FEATURE_OVERRIDES: Record<
  string,
  Partial<Record<"clarity" | "colorChromeEffect", boolean>>
> = {
  xt3: { clarity: false },
  xt30: { clarity: false },
  xt30ii: { clarity: false },
  xh1: { colorChromeEffect: true },
};

/**
 * Per-camera film simulation exceptions, same idea as above but for the
 * gated simulations SIM_GATES checks. X-S20 and X-M5 pair a gen-4 sensor
 * with X-Processor 5 and run Nostalgic Negative, which the per-generation
 * matrix says gen-4 lacks — without this, dial-in tells their owners to
 * "pick the closest simulation" for a sim their body has. Reala Ace
 * availability on these bodies is firmware-dependent and stays off until
 * verified.
 */
export const CAMERA_SIM_OVERRIDES: Record<
  string,
  Partial<Record<"classicNegative" | "nostalgicNegative" | "realaAce", boolean>>
> = {
  xs20: { nostalgicNegative: true },
  xm5: { nostalgicNegative: true },
};
