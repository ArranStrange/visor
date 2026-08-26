const assert = require("node:assert/strict");
const test = require("node:test");

const { plannedCountersFor } = require("../backfill-content-counters");

const ARRAY = { likeCountFrom: "array" };
const EXISTING = { likeCountFrom: "existing" };

test("derives a preset's likeCount from its likes array", () => {
  const { target } = plannedCountersFor(
    { likes: ["u1", "u2", "u3"], downloads: 0 },
    0,
    ARRAY
  );
  assert.equal(target.likeCount, 3);
});

test("leaves a film sim's likeCount alone", () => {
  // FilmSim.likes[] is empty by design after backfill-filmsim-likes.js parked
  // the legacy numeric value in likeCount. Deriving from the array would zero
  // every film sim's like count.
  const { target } = plannedCountersFor(
    { likes: [], likeCount: 42, downloads: 0 },
    0,
    EXISTING
  );
  assert.equal(target.likeCount, 42);
});

test("scores with the ratified weights", () => {
  const { target } = plannedCountersFor(
    { likes: ["u1"], downloads: 2 },
    3,
    ARRAY
  );

  assert.deepEqual(target, {
    likeCount: 1,
    saveCount: 3,
    popularityScore: 2 * 3 + 3 * 2 + 1,
  });
});

test("reports a document already holding the right counters as unchanged", () => {
  // This is what makes a second run a no-op.
  const doc = {
    likes: ["u1"],
    downloads: 2,
    likeCount: 1,
    saveCount: 3,
    popularityScore: 13,
  };

  assert.equal(plannedCountersFor(doc, 3, ARRAY).changed, false);
});

test("reports a stale score as changed even when the counts agree", () => {
  const doc = {
    likes: ["u1"],
    downloads: 2,
    likeCount: 1,
    saveCount: 3,
    popularityScore: 0,
  };

  assert.equal(plannedCountersFor(doc, 3, ARRAY).changed, true);
});

test("treats an absent counter as zero rather than throwing", () => {
  const { target, changed } = plannedCountersFor({}, 0, ARRAY);

  assert.deepEqual(target, {
    likeCount: 0,
    saveCount: 0,
    popularityScore: 0,
  });
  assert.equal(changed, false);
});
