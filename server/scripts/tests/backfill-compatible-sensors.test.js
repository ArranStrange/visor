const assert = require("node:assert/strict");
const test = require("node:test");

const {
  sensorsFor,
  PENDING_QUERY,
} = require("../backfill-compatible-sensors");

test("copies legacy sensor labels through unchanged", () => {
  assert.deepEqual(sensorsFor(["X-Trans III", "X-Trans IV"]), {
    known: ["X-Trans III", "X-Trans IV"],
    unknown: [],
  });
});

test("de-duplicates and trims", () => {
  assert.deepEqual(sensorsFor([" X-Trans V ", "X-Trans V", ""]), {
    known: ["X-Trans V"],
    unknown: [],
  });
});

test("reports values that are not sensor labels instead of copying them", () => {
  // The deprecated field is named compatibleCameras; if anything ever did put
  // a camera name in it, copying it would invent a sensor generation.
  assert.deepEqual(sensorsFor(["X-T5", "X-Trans V"]), {
    known: ["X-Trans V"],
    unknown: ["X-T5"],
  });
});

test("tolerates missing and non-string values", () => {
  assert.deepEqual(sensorsFor(undefined), { known: [], unknown: [] });
  assert.deepEqual(sensorsFor([null, 7]), { known: [], unknown: [] });
});

test("the pending query only selects documents the fallback is still serving", () => {
  // Anything with a populated compatibleSensors is left alone, which is what
  // makes a second run a no-op.
  assert.deepEqual(PENDING_QUERY, {
    compatibleCameras: { $exists: true, $ne: [] },
    compatibleSensors: { $in: [null, []] },
  });
});
