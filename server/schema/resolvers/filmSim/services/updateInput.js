const { UserInputError } = require("../../../../utils/errors");

// updateFilmSim takes `input: JSON!`, so without an allow-list the owner of a
// recipe can $set any field on the document — including the discovery counters
// (popularityScore, likeCount, downloads) that rank the POPULAR sort, and
// `creator`, which would hand the recipe to somebody else.
//
// Unknown keys are rejected rather than dropped: silently ignoring them means a
// client sending the wrong field name appears to succeed and persists nothing.
// This mirrors the filter builder in utils/contentFilters.js.
//
// The typed UpdateFilmSimInput this should eventually become is tied to the
// removal of the JSON scalar (see #139); until both sides can deploy together,
// this is the enforcement point.

const EDITABLE_FIELDS = new Set([
  "name",
  "description",
  "notes",
  "tags",
  "compatibleSensors",
  "settings",
  "sampleImages",
  "type",
]);

const buildFilmSimUpdate = (input) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new UserInputError("updateFilmSim input must be an object");
  }

  const update = {};

  for (const key of Object.keys(input)) {
    // Object.hasOwn, not truthiness: `constructor` and `__proto__` are not
    // editable fields but resolve on the prototype chain.
    if (!EDITABLE_FIELDS.has(key)) {
      throw new UserInputError(`"${key}" is not an editable film sim field`);
    }
    if (!Object.hasOwn(input, key)) continue;
    update[key] = input[key];
  }

  if (Object.keys(update).length === 0) {
    throw new UserInputError("updateFilmSim input contained no editable fields");
  }

  return update;
};

module.exports = { buildFilmSimUpdate, EDITABLE_FIELDS };
