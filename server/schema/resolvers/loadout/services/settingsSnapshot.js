// Snapshot + comparison of a film sim's in-camera settings, used to detect
// SOURCE_CHANGED staleness (#101): a recipe author edits their recipe after
// a loadout was keyed in — the camera now silently holds outdated values,
// and slot-write-based staleness can't see it.
//
// Whitelist-based on both sides so Mongoose internals (_id, __v) and any
// future FilmSim fields can never make two identical settings "differ".

const SETTINGS_KEYS = [
  "filmSimulation",
  "dynamicRange",
  "highlight",
  "shadow",
  "colour",
  "sharpness",
  "noiseReduction",
  "grainEffect",
  "clarity",
  "whiteBalance",
  "colorChromeEffect",
  "colorChromeFxBlue",
];

// Deliberate: an author changing a value from unset (null) to an explicit
// equivalent (e.g. highlight null → 0) DOES flag SOURCE_CHANGED even though
// the dialed camera state may be identical. Over-flagging errs toward the
// user re-checking a bank; under-flagging errs toward silently wrong banks.
const norm = (v) => (v === undefined ? null : v);

/** Copy just the in-camera settings fields, normalized (undefined → null). */
const pickSettings = (settings) => {
  if (!settings) return null;
  const out = {};
  for (const key of SETTINGS_KEYS) {
    out[key] = norm(settings[key]);
  }
  out.wbShift = {
    r: norm(settings.wbShift?.r),
    b: norm(settings.wbShift?.b),
  };
  return out;
};

/** Compare two snapshots (either may be a raw settings object). */
const settingsEqual = (a, b) => {
  if (a == null || b == null) return a == null && b == null;
  const pa = pickSettings(a);
  const pb = pickSettings(b);
  for (const key of SETTINGS_KEYS) {
    if (pa[key] !== pb[key]) return false;
  }
  return pa.wbShift.r === pb.wbShift.r && pa.wbShift.b === pb.wbShift.b;
};

module.exports = { pickSettings, settingsEqual, SETTINGS_KEYS };
