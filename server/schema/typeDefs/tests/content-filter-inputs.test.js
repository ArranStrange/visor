const assert = require("node:assert/strict");
const test = require("node:test");

const presetTypeDefs = require("../preset");
const filmSimTypeDefs = require("../filmSim");
const scalarTypeDefs = require("../scalars");

// Contract test for the typed list filters. The point of the typed inputs is
// that the schema itself enumerates what may be filtered on (#126) — if a
// field is added here without a matching allow-list entry in
// server/utils/contentFilters.js, the query fails at runtime, so the shape is
// pinned in both places.

test("PresetFilterInput exposes exactly the allow-listed fields", () => {
  const input = findInput(presetTypeDefs, "PresetFilterInput");
  assert.ok(input, "PresetFilterInput is missing");
  assert.deepEqual(fieldNames(input), ["tagId", "featured", "ids", "title"]);
});

test("FilmSimFilterInput exposes exactly the allow-listed fields", () => {
  const input = findInput(filmSimTypeDefs, "FilmSimFilterInput");
  assert.ok(input, "FilmSimFilterInput is missing");
  assert.deepEqual(fieldNames(input), [
    "tagId",
    "featured",
    "ids",
    "sensorKey",
    "cameraName",
    "name",
  ]);
});

test("every filter field is optional so callers can send a subset", () => {
  for (const [typeDefs, name] of [
    [presetTypeDefs, "PresetFilterInput"],
    [filmSimTypeDefs, "FilmSimFilterInput"],
  ]) {
    for (const field of findInput(typeDefs, name).fields) {
      assert.notEqual(
        field.type.kind,
        "NonNullType",
        `${name}.${field.name.value} must be optional`
      );
    }
  }
});

test("sensorKey is a flat scalar, not a nested input", () => {
  // Apollo's keyArgs hashes the argument value; a flat scalar keeps the
  // cache key stable across renders in a way a nested object does not.
  const sensorKey = findField(
    findInput(filmSimTypeDefs, "FilmSimFilterInput"),
    "sensorKey"
  );
  assert.equal(sensorKey.type.kind, "NamedType");
  assert.equal(sensorKey.type.name.value, "String");
});

test("both list queries take the typed input alongside the legacy JSON blob", () => {
  const listPresets = findQueryField(presetTypeDefs, "listPresets");
  const listFilmSims = findQueryField(filmSimTypeDefs, "listFilmSims");

  assert.equal(argType(listPresets, "where"), "PresetFilterInput");
  assert.equal(argType(listFilmSims, "where"), "FilmSimFilterInput");

  // The JSON argument stays for exactly one release; when it goes, these two
  // assertions are the reminder to delete it.
  assert.equal(argType(listPresets, "filter"), "JSON");
  assert.equal(argType(listFilmSims, "filter"), "JSON");
});

test("both list queries take search and sort", () => {
  for (const [typeDefs, name] of [
    [presetTypeDefs, "listPresets"],
    [filmSimTypeDefs, "listFilmSims"],
  ]) {
    const field = findQueryField(typeDefs, name);
    assert.equal(argType(field, "search"), "String", `${name}.search`);
    assert.equal(argType(field, "sort"), "ContentSort", `${name}.sort`);
  }
});

test("neither search nor sort is required, so existing callers still work", () => {
  for (const [typeDefs, name] of [
    [presetTypeDefs, "listPresets"],
    [filmSimTypeDefs, "listFilmSims"],
  ]) {
    const field = findQueryField(typeDefs, name);
    for (const argumentName of ["search", "sort"]) {
      const argument = field.arguments.find(
        (candidate) => candidate.name.value === argumentName
      );
      assert.notEqual(
        argument.type.kind,
        "NonNullType",
        `${name}.${argumentName} must be optional`
      );
    }
  }
});

test("ContentSort is POPULAR, not TRENDING", () => {
  // Ratified as Q3: the score has no time decay, so the enum must not promise
  // recency the implementation does not provide.
  const values = findEnum(scalarTypeDefs, "ContentSort").values.map(
    (value) => value.name.value
  );

  assert.deepEqual(values, [
    "NEWEST",
    "POPULAR",
    "MOST_DOWNLOADED",
    "MOST_SAVED",
  ]);
  assert.ok(!values.includes("TRENDING"));
});

function findInput(typeDefs, name) {
  return typeDefs.definitions.find(
    (definition) =>
      definition.kind === "InputObjectTypeDefinition" &&
      definition.name.value === name
  );
}

function findEnum(typeDefs, name) {
  return typeDefs.definitions.find(
    (definition) =>
      definition.kind === "EnumTypeDefinition" && definition.name.value === name
  );
}

function findField(input, name) {
  return input.fields.find((field) => field.name.value === name);
}

function fieldNames(input) {
  return input.fields.map((field) => field.name.value);
}

function findQueryField(typeDefs, name) {
  return typeDefs.definitions
    .filter(
      (definition) =>
        definition.kind === "ObjectTypeExtension" &&
        definition.name.value === "Query"
    )
    .flatMap((definition) => definition.fields)
    .find((field) => field.name.value === name);
}

function argType(field, argumentName) {
  const argument = field.arguments.find(
    (candidate) => candidate.name.value === argumentName
  );
  return argument?.type.name?.value;
}
