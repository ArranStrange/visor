const assert = require("node:assert/strict");
const test = require("node:test");

const { pickSettings, settingsEqual } = require("../settingsSnapshot");

const base = () => ({
  filmSimulation: "CLASSIC CHROME",
  dynamicRange: 400,
  highlight: -1,
  shadow: 2,
  colour: 1,
  sharpness: -2,
  noiseReduction: -4,
  grainEffect: "WEAK",
  clarity: -3,
  whiteBalance: "daylight",
  wbShift: { r: 3, b: -2 },
  colorChromeEffect: "STRONG",
  colorChromeFxBlue: "OFF",
});

test("identical settings compare equal", () => {
  assert.equal(settingsEqual(base(), base()), true);
});

test("a changed scalar is detected", () => {
  assert.equal(settingsEqual(base(), { ...base(), shadow: 3 }), false);
});

test("a changed wb shift is detected", () => {
  const b = base();
  b.wbShift = { r: 3, b: 0 };
  assert.equal(settingsEqual(base(), b), false);
});

test("undefined and null are the same absence", () => {
  const a = base();
  delete a.clarity;
  const b = { ...base(), clarity: null };
  assert.equal(settingsEqual(a, b), true);
});

test("mongoose internals never cause a difference", () => {
  const withNoise = { ...base(), _id: "abc123", __v: 3, extraFutureField: 1 };
  assert.equal(settingsEqual(base(), withNoise), true);
});

test("null snapshots only equal null", () => {
  assert.equal(settingsEqual(null, null), true);
  assert.equal(settingsEqual(null, base()), false);
  assert.equal(settingsEqual(base(), null), false);
});

test("pickSettings normalizes and whitelists", () => {
  const picked = pickSettings({ ...base(), _id: "noise" });
  assert.equal(picked._id, undefined);
  assert.equal(picked.wbShift.r, 3);
  const sparse = pickSettings({ filmSimulation: "PROVIA" });
  assert.equal(sparse.clarity, null);
  assert.equal(sparse.wbShift.r, null);
});
