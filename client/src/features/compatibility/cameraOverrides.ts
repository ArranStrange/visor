import type { SensorFeatures } from "./types";

/**
 * Per-camera feature exceptions the per-generation SensorFeatures matrix
 * can't express. Keyed by cameraKey (normalized). The prose notes in
 * fujifilmSensors.ts already document these; the compatibility service needs
 * them machine-readable so X-T3 owners aren't told to set Clarity their body
 * doesn't have.
 *
 * Re-exported from features/loadouts/constants/menuPaths for the dial-in
 * call sites that already import them from there.
 */
export const CAMERA_FEATURE_OVERRIDES: Record<
  string,
  Partial<Pick<SensorFeatures, "clarity" | "colorChromeEffect">>
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
  Partial<
    Pick<SensorFeatures, "classicNegative" | "nostalgicNegative" | "realaAce">
  >
> = {
  xs20: { nostalgicNegative: true },
  xm5: { nostalgicNegative: true },
};
