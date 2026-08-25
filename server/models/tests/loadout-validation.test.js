const assert = require("node:assert/strict");
const test = require("node:test");

const Loadout = require("../Loadout");

// doc.validate() runs schema validators and pre-validate hooks without a
// database connection, so the slot invariants are testable offline.

const build = (overrides = {}) =>
  new Loadout({
    name: "Lisbon, May",
    owner: "64b7f8f0f0f0f0f0f0f0f0f0",
    camera: "Fujifilm X-T5",
    ...overrides,
  });

test("camera resolves through normalization and snapshots bank count", async () => {
  const loadout = build();
  await loadout.validate();
  assert.equal(loadout.camera, "Fujifilm X-T5");
  assert.equal(loadout.cameraKey, "xt5");
  assert.equal(loadout.customBanks, 7);
});

test("unknown camera is rejected", async () => {
  const loadout = build({ camera: "Canon R5" });
  await assert.rejects(() => loadout.validate(), /not in the Fujifilm catalog/);
});

test("zero-bank bodies refuse loadout binding", async () => {
  const loadout = build({ camera: "X-T200" });
  await assert.rejects(() => loadout.validate(), /no custom settings banks/);
});

test("duplicate slot indices are rejected", async () => {
  const loadout = build({
    slots: [
      { index: 3, filmSim: null },
      { index: 3, filmSim: null },
    ],
  });
  await assert.rejects(() => loadout.validate(), /unique/i);
});

test("slot index beyond the body's bank count is rejected", async () => {
  const loadout = build({ slots: [{ index: 7, filmSim: null }] });
  await assert.rejects(() => loadout.validate(), /bank count/i);
});

test("a full seven-slot loadout with empties validates", async () => {
  const loadout = build({
    slots: [0, 1, 2, 3, 4, 5, 6].map((index) => ({ index, filmSim: null })),
  });
  await loadout.validate();
  assert.equal(loadout.slots.length, 7);
});

test("customBanks snapshot is not overwritten on later validation", async () => {
  const loadout = build();
  await loadout.validate();
  // Simulate a later catalog correction by hand-setting a different count
  // on a persisted doc: validation must respect the stored snapshot.
  loadout.isNew = false;
  loadout.customBanks = 6;
  await loadout.validate();
  assert.equal(loadout.customBanks, 6);
});
