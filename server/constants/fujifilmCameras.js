/**
 * Server copy of the canonical Fujifilm camera catalog.
 *
 * The client's camera → sensor mapping lives in
 * client/src/constants/fujifilmCameras.ts and drives UI concerns (pickers,
 * compatibility warnings). The server needs its own copy because Loadout
 * validation — slot capacity, camera identity — must be enforced where the
 * data is written, and the client bundle is not importable from CommonJS.
 *
 * The two catalogs are kept from drifting by
 * server/schema/typeDefs/tests/camera-catalog-drift.test.js, which parses
 * the client file and compares names and sensor keys.
 *
 * customBanks: how many custom settings banks (C1..Cn) the body exposes.
 *   - X-Trans III / IV / V bodies expose 7 (verified: X-T2 era onward).
 *   - X-Trans I / II counts are assumed at 7 pending manual verification —
 *     surface an "assuming 7" caveat in the UI (banksVerified: false).
 *   - Entry-level Bayer bodies have no custom settings recall: 0. A body
 *     with 0 banks refuses loadout binding rather than render phantom
 *     slots.
 *   - GFX bodies are assumed at 6 pending manual verification.
 */

const FUJIFILM_CAMERAS = [
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

  // X-Trans IV (26MP)
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

  // X-Trans V
  { name: "X-H2", sensorKey: "x-trans-v", customBanks: 7, banksVerified: true },
  { name: "X-H2S", sensorKey: "x-trans-v", customBanks: 7, banksVerified: true },
  { name: "X-T5", sensorKey: "x-trans-v", customBanks: 7, banksVerified: true },
  { name: "X-T50", sensorKey: "x-trans-v", customBanks: 7, banksVerified: true },
  { name: "X100VI", sensorKey: "x-trans-v", customBanks: 7, banksVerified: true },
  { name: "X-E5", sensorKey: "x-trans-v", customBanks: 7, banksVerified: true },

  // Bayer (entry-level X bodies and compacts) — no custom settings recall
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
 * "Fujifilm"/"Fuji", and remove all whitespace and hyphens. Must stay
 * behaviourally identical to the client's normalizeCameraName.
 */
const normalizeCameraName = (name) =>
  String(name || "")
    .toLowerCase()
    .replace(/^\s*fuji(film)?\s*/i, "")
    .replace(/[\s-]+/g, "");

/** Look up a catalog entry by any user-written form of the camera name. */
const findCamera = (cameraName) => {
  const normalized = normalizeCameraName(cameraName);
  if (!normalized) return undefined;
  return FUJIFILM_CAMERAS.find(
    (c) => normalizeCameraName(c.name) === normalized
  );
};

module.exports = { FUJIFILM_CAMERAS, normalizeCameraName, findCamera };
