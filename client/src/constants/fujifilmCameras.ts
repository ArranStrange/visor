/**
 * Canonical Fujifilm camera → sensor generation mapping.
 *
 * This is the single source of truth linking bodies to sensors; the
 * per-sensor camera lists in fujifilmSensors.ts are derived from it, so the
 * two can never drift. Scope: bodies relevant to film sim recipes —
 * X-mount interchangeable, the X100 line, notable fixed-lens compacts, GFX.
 *
 * Verified against Fujifilm specs / Fuji X Weekly (2026). Rumoured
 * 6th-generation bodies (X-T6, X-Pro4) are excluded until announced.
 */

export type SensorKey =
  | "x-trans-i"
  | "x-trans-ii"
  | "x-trans-iii"
  | "x-trans-iv"
  | "x-trans-v"
  | "bayer"
  | "gfx";

export interface FujifilmCamera {
  name: string;
  sensorKey: SensorKey;
  /**
   * Custom settings banks this body exposes (C1..Cn). 0 = the body has no
   * custom settings recall and refuses loadout binding. Kept in lockstep
   * with server/constants/fujifilmCameras.js — the drift test in
   * server/schema/typeDefs/tests/camera-catalog-drift.test.js fails the
   * build if the catalogs diverge.
   */
  customBanks: number;
  /** False = assumed count pending verification against the manual. */
  banksVerified: boolean;
}

export const FUJIFILM_CAMERAS: FujifilmCamera[] = [
  // X-Trans I (16MP)
  { name: "X-Pro1", sensorKey: "x-trans-i", customBanks: 7, banksVerified: false },
  { name: "X-E1", sensorKey: "x-trans-i", customBanks: 7, banksVerified: false },
  { name: "X-M1", sensorKey: "x-trans-i", customBanks: 7, banksVerified: false },

  // X-Trans II (16MP)
  { name: "X100S", sensorKey: "x-trans-ii", customBanks: 7, banksVerified: false },
  { name: "X100T", sensorKey: "x-trans-ii", customBanks: 7, banksVerified: false },
  { name: "X-E2", sensorKey: "x-trans-ii", customBanks: 7, banksVerified: false },
  { name: "X-E2S", sensorKey: "x-trans-ii", customBanks: 7, banksVerified: false },
  { name: "X-T1", sensorKey: "x-trans-ii", customBanks: 7, banksVerified: false },
  { name: "X-T10", sensorKey: "x-trans-ii", customBanks: 7, banksVerified: false },
  { name: "X70", sensorKey: "x-trans-ii", customBanks: 7, banksVerified: false },
  { name: "XQ1", sensorKey: "x-trans-ii", customBanks: 0, banksVerified: false },
  { name: "XQ2", sensorKey: "x-trans-ii", customBanks: 0, banksVerified: false },

  // X-Trans III (24MP)
  { name: "X-Pro2", sensorKey: "x-trans-iii", customBanks: 7, banksVerified: true },
  { name: "X-T2", sensorKey: "x-trans-iii", customBanks: 7, banksVerified: true },
  { name: "X-T20", sensorKey: "x-trans-iii", customBanks: 7, banksVerified: true },
  { name: "X100F", sensorKey: "x-trans-iii", customBanks: 7, banksVerified: true },
  { name: "X-E3", sensorKey: "x-trans-iii", customBanks: 7, banksVerified: true },
  { name: "X-H1", sensorKey: "x-trans-iii", customBanks: 7, banksVerified: true },

  // X-Trans IV (26MP) — X-S20 and X-M5 pair this sensor with X-Processor 5
  { name: "X-T3", sensorKey: "x-trans-iv", customBanks: 7, banksVerified: true },
  { name: "X-T30", sensorKey: "x-trans-iv", customBanks: 7, banksVerified: true },
  { name: "X-T30 II", sensorKey: "x-trans-iv", customBanks: 7, banksVerified: true },
  { name: "X-Pro3", sensorKey: "x-trans-iv", customBanks: 7, banksVerified: true },
  { name: "X100V", sensorKey: "x-trans-iv", customBanks: 7, banksVerified: true },
  { name: "X-T4", sensorKey: "x-trans-iv", customBanks: 7, banksVerified: true },
  { name: "X-S10", sensorKey: "x-trans-iv", customBanks: 7, banksVerified: true },
  { name: "X-E4", sensorKey: "x-trans-iv", customBanks: 7, banksVerified: true },
  { name: "X-S20", sensorKey: "x-trans-iv", customBanks: 7, banksVerified: true },
  { name: "X-M5", sensorKey: "x-trans-iv", customBanks: 7, banksVerified: true },

  // X-Trans V (40MP HR / 26MP HS stacked)
  { name: "X-H2", sensorKey: "x-trans-v", customBanks: 7, banksVerified: true },
  { name: "X-H2S", sensorKey: "x-trans-v", customBanks: 7, banksVerified: true },
  { name: "X-T5", sensorKey: "x-trans-v", customBanks: 7, banksVerified: true },
  { name: "X-T50", sensorKey: "x-trans-v", customBanks: 7, banksVerified: true },
  { name: "X100VI", sensorKey: "x-trans-v", customBanks: 7, banksVerified: true },
  { name: "X-E5", sensorKey: "x-trans-v", customBanks: 7, banksVerified: true },

  // Bayer (entry-level X bodies and compacts)
  { name: "X100", sensorKey: "bayer", customBanks: 0, banksVerified: false },
  { name: "X-A1", sensorKey: "bayer", customBanks: 0, banksVerified: false },
  { name: "X-A2", sensorKey: "bayer", customBanks: 0, banksVerified: false },
  { name: "X-A3", sensorKey: "bayer", customBanks: 0, banksVerified: false },
  { name: "X-A5", sensorKey: "bayer", customBanks: 0, banksVerified: false },
  { name: "X-A7", sensorKey: "bayer", customBanks: 0, banksVerified: false },
  { name: "X-A10", sensorKey: "bayer", customBanks: 0, banksVerified: false },
  { name: "X-T100", sensorKey: "bayer", customBanks: 0, banksVerified: false },
  { name: "X-T200", sensorKey: "bayer", customBanks: 0, banksVerified: false },
  { name: "XF10", sensorKey: "bayer", customBanks: 0, banksVerified: false },

  // GFX medium format
  { name: "GFX 50S", sensorKey: "gfx", customBanks: 6, banksVerified: false },
  { name: "GFX 50R", sensorKey: "gfx", customBanks: 6, banksVerified: false },
  { name: "GFX 50S II", sensorKey: "gfx", customBanks: 6, banksVerified: false },
  { name: "GFX 100", sensorKey: "gfx", customBanks: 6, banksVerified: false },
  { name: "GFX 100S", sensorKey: "gfx", customBanks: 6, banksVerified: false },
  { name: "GFX 100 II", sensorKey: "gfx", customBanks: 6, banksVerified: false },
  { name: "GFX 100S II", sensorKey: "gfx", customBanks: 6, banksVerified: false },
  { name: "GFX100RF", sensorKey: "gfx", customBanks: 6, banksVerified: false },
];

/**
 * Normalize a camera name for matching: lowercase, drop a leading
 * "Fujifilm"/"Fuji", and remove all whitespace and hyphens so
 * "Fujifilm X-T30 II", "fuji xt30ii" and "X-T30II" all match.
 */
export const normalizeCameraName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/^\s*fuji(film)?\s*/i, "")
    .replace(/[\s-]+/g, "");

export const camerasForSensor = (sensorKey: SensorKey): string[] =>
  FUJIFILM_CAMERAS.filter((c) => c.sensorKey === sensorKey).map((c) => c.name);

export const sensorKeyForCamera = (
  cameraName: string
): SensorKey | undefined => {
  const normalized = normalizeCameraName(cameraName);
  if (!normalized) return undefined;
  return FUJIFILM_CAMERAS.find(
    (c) => normalizeCameraName(c.name) === normalized
  )?.sensorKey;
};

/** Catalog entry for a camera by any user-written form of its name. */
export const findCamera = (cameraName: string): FujifilmCamera | undefined => {
  const normalized = normalizeCameraName(cameraName);
  if (!normalized) return undefined;
  return FUJIFILM_CAMERAS.find(
    (c) => normalizeCameraName(c.name) === normalized
  );
};

/** Bodies that can hold a loadout — at least one custom settings bank. */
export const LOADOUT_CAPABLE_CAMERAS = FUJIFILM_CAMERAS.filter(
  (c) => c.customBanks > 0
);
