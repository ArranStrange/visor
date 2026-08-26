const assert = require("node:assert/strict");
const test = require("node:test");

const Preset = require("../Preset");
const FilmSim = require("../FilmSim");

// The sort orders the discovery grid offers are only usable if the field they
// sort on is indexed — without these, every sorted page is a collection scan
// plus an in-memory sort, and Preset had no secondary index at all before
// Phase 3. Declared indexes are cheap to assert and easy to lose in a merge.

const SORT_INDEXES = [
  { createdAt: -1 },
  { downloads: -1 },
  { likeCount: -1 },
  { saveCount: -1 },
  { popularityScore: -1 },
  { featured: 1 },
];

const declaredIndexes = (model) =>
  model.schema.indexes().map(([fields]) => fields);

const hasIndex = (model, wanted) =>
  declaredIndexes(model).some(
    (fields) =>
      Object.keys(fields).length === Object.keys(wanted).length &&
      Object.entries(wanted).every(([key, order]) => fields[key] === order)
  );

for (const [name, model] of [
  ["Preset", Preset],
  ["FilmSim", FilmSim],
]) {
  test(`${name} indexes every sortable discovery field`, () => {
    for (const wanted of SORT_INDEXES) {
      assert.ok(
        hasIndex(model, wanted),
        `${name} is missing an index on ${JSON.stringify(wanted)}`
      );
    }
  });
}

test("FilmSim keeps exactly one text index", () => {
  // Mongo allows only one text index per collection, so the pre-existing
  // name/description/tags index stays and the search argument uses an escaped
  // regex instead. A second text index would fail at index creation, i.e. at
  // deploy time rather than in a test.
  const textIndexes = declaredIndexes(FilmSim).filter((fields) =>
    Object.values(fields).includes("text")
  );

  assert.equal(textIndexes.length, 1);
});

test("Preset declares no text index", () => {
  const textIndexes = declaredIndexes(Preset).filter((fields) =>
    Object.values(fields).includes("text")
  );

  assert.deepEqual(textIndexes, []);
});
