const assert = require("node:assert/strict");
const test = require("node:test");

const presetTypeDefs = require("../preset");

test("preset inputs keep distinct create and update contracts without dead upload input", () => {
  const createInput = findInput("CreatePresetInput");
  const updateInput = findInput("UpdatePresetInput");

  assert.equal(findInput("UploadPresetInput"), undefined);
  assert.equal(findField(createInput, "title").type.kind, "NonNullType");
  assert.equal(findField(createInput, "slug").type.kind, "NonNullType");
  assert.equal(findField(updateInput, "title").type.kind, "NamedType");
  assert.equal(findField(updateInput, "slug"), undefined);
});

function findInput(name) {
  return presetTypeDefs.definitions.find(
    (definition) =>
      definition.kind === "InputObjectTypeDefinition" &&
      definition.name.value === name
  );
}

function findField(input, name) {
  return input.fields.find((field) => field.name.value === name);
}
