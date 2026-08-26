const assert = require("node:assert/strict");
const test = require("node:test");

const { buildFilmSimUpdate } = require("../updateInput");

test("passes through the fields the edit form sends", () => {
  const input = {
    name: "Everyday Chrome",
    description: "a look",
    notes: "shot wide open",
    compatibleSensors: ["X-Trans V"],
    settings: { filmSimulation: "CLASSIC CHROME" },
  };

  assert.deepEqual(buildFilmSimUpdate(input), input);
});

test("refuses the discovery counters that rank the POPULAR sort", () => {
  // The whole point: an owner must not be able to pin their own recipe to the
  // top of the listings by writing the ranking field directly.
  for (const field of [
    "popularityScore",
    "likeCount",
    "saveCount",
    "downloads",
    "likes",
  ]) {
    assert.throws(
      () => buildFilmSimUpdate({ name: "ok", [field]: 999999 }),
      new RegExp(`"${field}" is not an editable`),
      `${field} must be rejected`
    );
  }
});

test("refuses ownership and identity fields", () => {
  assert.throws(
    () => buildFilmSimUpdate({ creator: "someone-else" }),
    /not an editable/
  );
  assert.throws(() => buildFilmSimUpdate({ slug: "hijacked" }), /not an editable/);
  assert.throws(() => buildFilmSimUpdate({ _id: "other" }), /not an editable/);
});

test("refuses prototype-chain keys rather than throwing a raw TypeError", () => {
  assert.throws(
    () => buildFilmSimUpdate(JSON.parse('{"__proto__": {"admin": true}}')),
    /not an editable/
  );
  assert.throws(() => buildFilmSimUpdate({ constructor: 1 }), /not an editable/);
});

test("rejects a non-object input", () => {
  assert.throws(() => buildFilmSimUpdate(null), /must be an object/);
  assert.throws(() => buildFilmSimUpdate("name"), /must be an object/);
  assert.throws(() => buildFilmSimUpdate([{ name: "x" }]), /must be an object/);
});

test("rejects an input with nothing editable in it", () => {
  assert.throws(() => buildFilmSimUpdate({}), /no editable fields/);
});
