const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildContentSort,
  CONTENT_SORTS,
  DEFAULT_CONTENT_SORT,
  PRESET_LIST_BASE,
  withSearchClause,
} = require("../contentFilters");
const { UserInputError } = require("../errors");

// The end-to-end behaviour (search matching, count/page agreement) is covered
// by the resolver integration test, which needs a database. These are the
// pure pieces: the sort mapping, the clause merge, and the always-on preset
// predicate.

test("the enum maps to exactly the four ratified orders", () => {
  assert.deepEqual(Object.keys(CONTENT_SORTS), [
    "NEWEST",
    "POPULAR",
    "MOST_DOWNLOADED",
    "MOST_SAVED",
  ]);
});

test("POPULAR sorts on the denormalised score, not a computed one", () => {
  // If this ever becomes an aggregation the sort stops using an index, which
  // is the whole reason popularityScore is maintained by $inc.
  assert.deepEqual(CONTENT_SORTS.POPULAR, {
    popularityScore: -1,
    createdAt: -1,
    _id: -1,
  });
});

test("every order is a total order, ending in a unique key", () => {
  // A partial order is not enough for skip/limit paging. Hundreds of documents
  // share a score of 0, and createdAt does not separate them either when they
  // were written in the same millisecond — a seed script or bulk import does
  // exactly that. Only _id is guaranteed unique, so it has to be last.
  for (const [name, spec] of Object.entries(CONTENT_SORTS)) {
    const keys = Object.keys(spec);
    assert.equal(keys.at(-1), "_id", `${name} does not end in a unique key`);
    assert.equal(spec._id, -1, `${name} must break the final tie consistently`);

    if (name !== "NEWEST") {
      assert.equal(spec.createdAt, -1, `${name} has no recency tiebreak`);
      assert.equal(keys.length, 3);
    }
  }
});

test("an absent sort falls back to the default", () => {
  assert.deepEqual(buildContentSort(undefined), CONTENT_SORTS.NEWEST);
  assert.deepEqual(buildContentSort(null), CONTENT_SORTS.NEWEST);
  assert.equal(DEFAULT_CONTENT_SORT, "NEWEST");
});

test("each named sort resolves to its spec", () => {
  for (const name of Object.keys(CONTENT_SORTS)) {
    assert.deepEqual(buildContentSort(name), CONTENT_SORTS[name]);
  }
});

test("an unknown sort is rejected rather than silently defaulted", () => {
  // GraphQL validates the enum, but the JSON `filter` blob and internal
  // callers bypass that; a silent default would hide a client bug.
  assert.throws(() => buildContentSort("TRENDING"), UserInputError);
  assert.throws(() => buildContentSort("popular"), /Unknown sort/);
});

test("an inherited key is not mistaken for a sort", () => {
  assert.throws(() => buildContentSort("constructor"), /Unknown sort/);
  assert.throws(() => buildContentSort("toString"), /Unknown sort/);
});

test("every preset listing carries the after-image predicate", () => {
  // Held here rather than in the resolver so the count and the page are built
  // from one query by construction (#119).
  assert.deepEqual(PRESET_LIST_BASE, {
    afterImage: { $exists: true, $ne: null },
  });
});

test("a search clause merges into a query with no $or of its own", () => {
  const merged = withSearchClause(
    { featured: true },
    { $or: [{ title: /x/i }] }
  );

  assert.deepEqual(Object.keys(merged).sort(), ["$or", "featured"]);
});

test("a search clause does not clobber the sensor filter's $or", () => {
  // The regression this prevents: spreading two objects that both have `$or`
  // keeps only the second, so a sensor-filtered search would quietly return
  // film sims for every generation.
  const sensorOr = [{ compatibleSensors: "X-Trans V" }];
  const searchOr = [{ name: /portra/i }];

  const merged = withSearchClause({ $or: sensorOr }, { $or: searchOr });

  assert.deepEqual(merged, {
    $and: [{ $or: sensorOr }, { $or: searchOr }],
  });
  assert.equal(merged.$or, undefined);
});

test("no clause leaves the query untouched", () => {
  const query = { featured: true };
  assert.equal(withSearchClause(query, null), query);
});
