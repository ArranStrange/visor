const assert = require("node:assert/strict");
const test = require("node:test");

const {
  plannedUpdateFor,
  PENDING_QUERY,
} = require("../backfill-filmsim-likes");

test("preserves the legacy count as likeCount and empties the array", () => {
  assert.deepEqual(plannedUpdateFor({ likes: 12 }), {
    likes: [],
    likeCount: 12,
  });
});

test("a zero count stays zero", () => {
  assert.deepEqual(plannedUpdateFor({ likes: 0 }), { likes: [], likeCount: 0 });
});

test("floors a fractional count rather than storing it", () => {
  assert.deepEqual(plannedUpdateFor({ likes: 3.7 }), {
    likes: [],
    likeCount: 3,
  });
});

test("refuses to carry a nonsensical count forward", () => {
  // A count is a non-negative integer. A bad value in the old field must not
  // become a bad value in the new one, where it would then be $inc'd.
  for (const likes of [-4, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.deepEqual(plannedUpdateFor({ likes }), { likes: [], likeCount: 0 });
  }
});

test("tolerates a missing or already-migrated value", () => {
  assert.deepEqual(plannedUpdateFor({}), { likes: [], likeCount: 0 });
  assert.deepEqual(plannedUpdateFor({ likes: [] }), {
    likes: [],
    likeCount: 0,
  });
});

test("the pending query only selects documents still holding a number", () => {
  // This is what makes a second run a no-op: once `likes` is an array, the
  // $type filter stops matching it.
  assert.deepEqual(PENDING_QUERY, { likes: { $type: "number" } });
});
