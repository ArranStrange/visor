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
}

export const FUJIFILM_CAMERAS: FujifilmCamera[] = [
  // X-Trans I (16MP)
  { name: "X-Pro1", sensorKey: "x-trans-i" },
  { name: "X-E1", sensorKey: "x-trans-i" },
  { name: "X-M1", sensorKey: "x-trans-i" },

  // X-Trans II (16MP)
  { name: "X100S", sensorKey: "x-trans-ii" },
  { name: "X100T", sensorKey: "x-trans-ii" },
  { name: "X-E2", sensorKey: "x-trans-ii" },
  { name: "X-E2S", sensorKey: "x-trans-ii" },
  { name: "X-T1", sensorKey: "x-trans-ii" },
  { name: "X-T10", sensorKey: "x-trans-ii" },
  { name: "X70", sensorKey: "x-trans-ii" },
  { name: "XQ1", sensorKey: "x-trans-ii" },
  { name: "XQ2", sensorKey: "x-trans-ii" },

  // X-Trans III (24MP)
  { name: "X-Pro2", sensorKey: "x-trans-iii" },
  { name: "X-T2", sensorKey: "x-trans-iii" },
  { name: "X-T20", sensorKey: "x-trans-iii" },
  { name: "X100F", sensorKey: "x-trans-iii" },
  { name: "X-E3", sensorKey: "x-trans-iii" },
  { name: "X-H1", sensorKey: "x-trans-iii" },

  // X-Trans IV (26MP) — X-S20 and X-M5 pair this sensor with X-Processor 5
  { name: "X-T3", sensorKey: "x-trans-iv" },
  { name: "X-T30", sensorKey: "x-trans-iv" },
  { name: "X-T30 II", sensorKey: "x-trans-iv" },
  { name: "X-Pro3", sensorKey: "x-trans-iv" },
  { name: "X100V", sensorKey: "x-trans-iv" },
  { name: "X-T4", sensorKey: "x-trans-iv" },
  { name: "X-S10", sensorKey: "x-trans-iv" },
  { name: "X-E4", sensorKey: "x-trans-iv" },
  { name: "X-S20", sensorKey: "x-trans-iv" },
  { name: "X-M5", sensorKey: "x-trans-iv" },

  // X-Trans V (40MP HR / 26MP HS stacked)
  { name: "X-H2", sensorKey: "x-trans-v" },
  { name: "X-H2S", sensorKey: "x-trans-v" },
  { name: "X-T5", sensorKey: "x-trans-v" },
  { name: "X-T50", sensorKey: "x-trans-v" },
  { name: "X100VI", sensorKey: "x-trans-v" },
  { name: "X-E5", sensorKey: "x-trans-v" },

  // Bayer (entry-level X bodies and compacts)
  { name: "X100", sensorKey: "bayer" },
  { name: "X-A1", sensorKey: "bayer" },
  { name: "X-A2", sensorKey: "bayer" },
  { name: "X-A3", sensorKey: "bayer" },
  { name: "X-A5", sensorKey: "bayer" },
  { name: "X-A7", sensorKey: "bayer" },
  { name: "X-A10", sensorKey: "bayer" },
  { name: "X-T100", sensorKey: "bayer" },
  { name: "X-T200", sensorKey: "bayer" },
  { name: "XF10", sensorKey: "bayer" },

  // GFX medium format
  { name: "GFX 50S", sensorKey: "gfx" },
  { name: "GFX 50R", sensorKey: "gfx" },
  { name: "GFX 50S II", sensorKey: "gfx" },
  { name: "GFX 100", sensorKey: "gfx" },
  { name: "GFX 100S", sensorKey: "gfx" },
  { name: "GFX 100 II", sensorKey: "gfx" },
  { name: "GFX 100S II", sensorKey: "gfx" },
  { name: "GFX100RF", sensorKey: "gfx" },
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
