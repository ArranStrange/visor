const assert = require("node:assert/strict");
const test = require("node:test");

const {
  POPULARITY_WEIGHTS,
  popularityScoreFor,
  asCount,
} = require("../popularity");

test("the ratified weights are download 3, save 2, like 1", () => {
  // Pinned because the mutations $inc by these numbers and the backfill
  // recomputes with them; a silent change here would leave every existing
  // document scored on the old weights and every new one on the new.
  assert.deepEqual({ ...POPULARITY_WEIGHTS }, {
    download: 3,
    save: 2,
    like: 1,
  });
});

test("scores a document from its counters", () => {
  assert.equal(
    popularityScoreFor({ downloads: 2, saveCount: 3, likeCount: 4 }),
    2 * 3 + 3 * 2 + 4
  );
});

test("an untouched document scores zero", () => {
  assert.equal(popularityScoreFor({}), 0);
  assert.equal(popularityScoreFor(), 0);
});

test("a download outweighs a save, which outweighs a like", () => {
  const download = popularityScoreFor({ downloads: 1 });
  const save = popularityScoreFor({ saveCount: 1 });
  const like = popularityScoreFor({ likeCount: 1 });

  assert.ok(download > save && save > like && like > 0);
});

test("asCount refuses negative, fractional and non-numeric values", () => {
  assert.equal(asCount(7), 7);
  assert.equal(asCount(7.9), 7);
  assert.equal(asCount(-1), 0);
  assert.equal(asCount(Number.NaN), 0);
  assert.equal(asCount(undefined), 0);
  assert.equal(asCount("5"), 0);
});
