const assert = require("node:assert/strict");
const test = require("node:test");

const loadoutTypeDefs = require("../loadout");

const findType = (name) =>
  loadoutTypeDefs.definitions.find(
    (d) => d.kind === "ObjectTypeDefinition" && d.name.value === name
  );

const findExtension = (name) =>
  loadoutTypeDefs.definitions.find(
    (d) => d.kind === "ObjectTypeExtension" && d.name.value === name
  );

const findField = (type, name) =>
  type.fields.find((f) => f.name.value === name);

test("loadout queries take no userId argument — owner comes from auth context", () => {
  const query = findExtension("Query");
  for (const field of query.fields) {
    const argNames = field.arguments.map((a) => a.name.value);
    assert.ok(
      !argNames.includes("userId"),
      `${field.name.value} must not take userId`
    );
  }
});

test("slot film sim is nullable but the slots array is not", () => {
  const slot = findType("LoadoutSlot");
  assert.equal(findField(slot, "filmSim").type.kind, "NamedType");
  assert.equal(findField(slot, "filmSimName").type.kind, "NamedType");

  const loadout = findType("Loadout");
  const slots = findField(loadout, "slots");
  // [LoadoutSlot!]!
  assert.equal(slots.type.kind, "NonNullType");
  assert.equal(slots.type.type.kind, "ListType");
  assert.equal(slots.type.type.type.kind, "NonNullType");
});

test("staleness is served derived — isStale exists, no isPublic in this stage", () => {
  const loadout = findType("Loadout");
  assert.equal(findField(loadout, "isStale").type.kind, "NonNullType");
  assert.equal(findField(loadout, "isPublic"), undefined);
});

test("slot writes go through one atomic mutation, not add/remove pairs", () => {
  const mutation = findExtension("Mutation");
  const names = mutation.fields.map((f) => f.name.value);
  assert.ok(names.includes("setLoadoutSlots"));
  assert.ok(!names.some((n) => /addTo|removeFrom/.test(n)));
});
