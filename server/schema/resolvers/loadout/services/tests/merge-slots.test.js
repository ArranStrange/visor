const assert = require("node:assert/strict");
const test = require("node:test");

const { validateSlotInputs, mergeSlots } = require("../mergeSlots");

const nameById = new Map([["aaaaaaaaaaaaaaaaaaaaaaaa", "Everyday Chrome"]]);

test("assigning a film sim snapshots its name", () => {
  const next = mergeSlots(
    [{ index: 0, filmSimId: "AAAAAAAAAAAAAAAAAAAAAAAA" }],
    [],
    nameById
  );
  assert.deepEqual(next, [
    {
      index: 0,
      filmSim: "AAAAAAAAAAAAAAAAAAAAAAAA",
      filmSimName: "Everyday Chrome",
      note: null,
    },
  ]);
});

test("a slot without filmSimId preserves the dangling snapshot", () => {
  // The F1 regression: C3 holds a deleted recipe (ref null, name kept).
  // Filling C5 echoes C3 back without a filmSimId — the snapshot and the
  // null ref must both survive.
  const existing = [
    { index: 3, filmSim: null, filmSimName: "Blue Hour", note: "pull -1/3" },
  ];
  const next = mergeSlots(
    [{ index: 3 }, { index: 5, filmSimId: "AAAAAAAAAAAAAAAAAAAAAAAA" }],
    existing,
    nameById
  );
  assert.deepEqual(next[0], {
    index: 3,
    filmSim: null,
    filmSimName: "Blue Hour",
    note: "pull -1/3",
  });
  assert.equal(next[1].filmSimName, "Everyday Chrome");
});

test("preserve keeps a live reference too, and input note wins", () => {
  const existing = [
    { index: 1, filmSim: "bbb", filmSimName: "Harsh Noon", note: null },
  ];
  const next = mergeSlots([{ index: 1, note: "midday only" }], existing, nameById);
  assert.deepEqual(next, [
    { index: 1, filmSim: "bbb", filmSimName: "Harsh Noon", note: "midday only" },
  ]);
});

test("omitting an index clears the bank (full-array replace)", () => {
  const existing = [
    { index: 0, filmSim: "bbb", filmSimName: "Harsh Noon", note: null },
  ];
  const next = mergeSlots([], existing, nameById);
  assert.deepEqual(next, []);
});

test("an id the visibility filter excluded is rejected", () => {
  assert.throws(
    () => mergeSlots([{ index: 0, filmSimId: "cccccccccccccccccccccccc" }], [], nameById),
    /not found/
  );
});

test("film sim id matching is case-insensitive", () => {
  const next = mergeSlots(
    [{ index: 0, filmSimId: "AaAaAaAaAaAaAaAaAaAaAaAa" }],
    [],
    nameById
  );
  assert.equal(next[0].filmSimName, "Everyday Chrome");
});

test("validateSlotInputs rejects duplicates and out-of-range indices", () => {
  assert.throws(() => validateSlotInputs([{ index: 2 }, { index: 2 }], 7), /unique/);
  assert.throws(() => validateSlotInputs([{ index: 7 }], 7), /C1–C7/);
  assert.throws(() => validateSlotInputs([{ index: -1 }], 7), /C1–C7/);
  assert.throws(() => validateSlotInputs([{ index: 1.5 }], 7), /C1–C7/);
  validateSlotInputs([{ index: 0 }, { index: 6 }], 7); // does not throw
});
