const assert = require("node:assert/strict");
const test = require("node:test");
const mongoose = require("mongoose");

const {
  buildPresetFilterQuery,
  buildFilmSimFilterQuery,
} = require("../contentFilters");
const { UserInputError } = require("../errors");

const OID = "507f1f77bcf86cd799439011";
const OTHER_OID = "507f1f77bcf86cd799439012";

test("an absent filter matches everything", () => {
  assert.deepEqual(buildPresetFilterQuery(undefined, undefined), {});
  assert.deepEqual(buildFilmSimFilterQuery(null, null), {});
});

test("tagId is cast to an ObjectId", () => {
  const query = buildPresetFilterQuery(undefined, { tagId: OID });
  const [tag] = query.tags.$in;
  assert.ok(tag instanceof mongoose.Types.ObjectId);
  assert.equal(tag.toString(), OID);
});

test("a malformed tagId is rejected rather than passed through as a string", () => {
  // The old builder handed Mongo the raw string, which silently matched
  // nothing instead of telling the caller their id was wrong.
  assert.throws(
    () => buildPresetFilterQuery(undefined, { tagId: "not-an-id" }),
    /not a valid id/
  );
});

test("featured must be a real boolean", () => {
  assert.deepEqual(buildPresetFilterQuery(undefined, { featured: true }), {
    featured: true,
  });
  assert.throws(
    () => buildPresetFilterQuery({ featured: "true" }, undefined),
    /must be a boolean/
  );
});

test("unknown fields are rejected instead of copied into the query", () => {
  assert.throws(
    () => buildPresetFilterQuery({ password: "x" }, undefined),
    /Unknown filter field "password"/
  );
  assert.throws(
    () => buildFilmSimFilterQuery(undefined, { creator: OID }),
    /Unknown filter field "creator"/
  );
});

test("prototype-chain keys are rejected like any other unknown field", () => {
  // The field map is a plain object, so a lookup by truthiness finds
  // Object.prototype members: `constructor` resolved to the Object
  // constructor and was called as a silent no-op, and `__proto__` resolved to
  // a non-function and blew up as a raw TypeError (a 500) instead of a
  // rejected query. Both must come back as ordinary unknown fields.
  assert.throws(
    () => buildPresetFilterQuery({ constructor: "x" }, undefined),
    /Unknown filter field "constructor"/
  );
  assert.throws(
    () => buildFilmSimFilterQuery(undefined, { toString: "x" }),
    /Unknown filter field "toString"/
  );

  // JSON.parse makes "__proto__" an own property, which is exactly how the
  // legacy `filter: JSON` argument arrives off the wire.
  const fromWire = JSON.parse('{"__proto__": {"featured": true}}');
  assert.throws(
    () => buildPresetFilterQuery(fromWire, undefined),
    /Unknown filter field "__proto__"/
  );
  assert.throws(
    () => buildPresetFilterQuery(fromWire, undefined),
    UserInputError
  );
});

test("operator keys are rejected at every depth (#126)", () => {
  assert.throws(
    () => buildPresetFilterQuery({ $where: "1 === 1" }, undefined),
    /Unknown filter field/
  );
  assert.throws(
    () => buildPresetFilterQuery({ title: { $ne: null } }, undefined),
    /not allowed/
  );
  assert.throws(
    () => buildFilmSimFilterQuery({ name: { a: { $gt: "" } } }, undefined),
    /not allowed/
  );
});

test("operator-shaped string values are rejected too", () => {
  assert.throws(
    () => buildPresetFilterQuery({ title: "$where" }, undefined),
    /not allowed/
  );
});

test("the legacy _id $in shape is parsed by hand into validated ids", () => {
  const query = buildPresetFilterQuery({ _id: { $in: [OID, OTHER_OID] } });
  assert.equal(query._id.$in.length, 2);
  assert.ok(query._id.$in.every((id) => id instanceof mongoose.Types.ObjectId));

  assert.throws(
    () => buildPresetFilterQuery({ _id: { $in: [{ $ne: null }] } }),
    /not allowed/
  );
  assert.throws(
    () => buildPresetFilterQuery({ _id: { $in: ["not-an-id"] } }),
    /not a valid id/
  );
  assert.throws(
    () => buildPresetFilterQuery({ _id: { $gt: "" } }),
    /must be a list of ids/
  );
});

test("the typed ids field produces the same query as the legacy shape", () => {
  assert.deepEqual(
    buildFilmSimFilterQuery(undefined, { ids: [OID] }),
    buildFilmSimFilterQuery({ _id: { $in: [OID] } }, undefined)
  );
});

test("sensorKey matches compatibleSensors and falls back to legacy documents", () => {
  const query = buildFilmSimFilterQuery(undefined, { sensorKey: "x-trans-iv" });
  assert.deepEqual(query, {
    $or: [
      { compatibleSensors: "X-Trans IV" },
      {
        compatibleSensors: { $in: [null, []] },
        compatibleCameras: "X-Trans IV",
      },
    ],
  });
});

test("cameraName resolves to the body's sensor generation", () => {
  assert.deepEqual(
    buildFilmSimFilterQuery(undefined, { cameraName: "Fujifilm X-T30 II" }),
    buildFilmSimFilterQuery(undefined, { sensorKey: "x-trans-iv" })
  );
});

test("unknown sensors and cameras are rejected, not silently ignored", () => {
  assert.throws(
    () => buildFilmSimFilterQuery(undefined, { sensorKey: "foveon" }),
    /not a known sensor/
  );
  assert.throws(
    () => buildFilmSimFilterQuery(undefined, { cameraName: "Nikon Z6" }),
    /not a known camera/
  );
});

test("the legacy compatibleSensors label filter keeps working", () => {
  assert.deepEqual(
    buildFilmSimFilterQuery({ compatibleSensors: "X-Trans V" }, undefined),
    buildFilmSimFilterQuery(undefined, { sensorKey: "x-trans-v" })
  );
});

test("presets have no sensor fields — those belong to film sims only", () => {
  assert.throws(
    () => buildPresetFilterQuery(undefined, { sensorKey: "x-trans-v" }),
    /Unknown filter field "sensorKey"/
  );
});

test("the typed input is merged over the legacy blob", () => {
  const query = buildPresetFilterQuery({ featured: true }, { title: "Kodak" });
  assert.deepEqual(query, { featured: true, title: "Kodak" });
});

test("null and undefined members are skipped, not treated as matches", () => {
  // GraphQL sends every unset input field as null, so a `where` object is
  // almost always mostly nulls.
  assert.deepEqual(
    buildFilmSimFilterQuery(undefined, {
      tagId: null,
      featured: null,
      ids: null,
      sensorKey: null,
      cameraName: null,
      name: undefined,
    }),
    {}
  );
});

test("a non-object filter is rejected", () => {
  assert.throws(() => buildPresetFilterQuery("featured", undefined), /must be an object/);
  assert.throws(() => buildPresetFilterQuery([], undefined), /must be an object/);
});
