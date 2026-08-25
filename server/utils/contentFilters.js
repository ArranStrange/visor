const mongoose = require("mongoose");
const { UserInputError } = require("./errors");
const {
  findCamera,
  SENSOR_LABELS_BY_KEY,
} = require("../constants/fujifilmCameras");

/**
 * One validated builder for the `listPresets` / `listFilmSims` filters.
 *
 * Both the legacy `filter: JSON` argument and the typed `where:
 * PresetFilterInput` / `FilmSimFilterInput` arguments route through here.
 * Before this existed, every key on the JSON blob was copied verbatim into
 * the Mongo query, so a client could send `{ $where: "..." }` or
 * `{ password: { $ne: null } }` and query fields the schema never exposed
 * (#126).
 *
 * The rules:
 *  - Only allow-listed keys survive; anything else is rejected loudly rather
 *    than silently dropped, so a typo in a client query is visible.
 *  - No `$`-prefixed key or string value may reach Mongo, at any depth. The
 *    single exception is the legacy `_id: { $in: [...] }` shape, which is
 *    parsed by hand into a list of validated ObjectIds.
 *  - `sensorKey` / `cameraName` become an `$or` across `compatibleSensors`
 *    and the deprecated `compatibleCameras`, mirroring the fallback in
 *    resolvers/filmSim/types.js so documents that predate the rename (and
 *    have not been through the backfill script) still match.
 *
 * The legacy JSON argument is accepted for exactly one release — see the
 * dated removal issue referenced from the schema.
 */

const OPERATOR_PREFIX = "$";

const rejectOperators = (value, path) => {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => rejectOperators(entry, `${path}[${index}]`));
    return;
  }

  if (value !== null && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      if (key.startsWith(OPERATOR_PREFIX)) {
        throw new UserInputError(
          `Filter key "${path}.${key}" is not allowed`
        );
      }
      rejectOperators(nested, `${path}.${key}`);
    }
    return;
  }

  if (typeof value === "string" && value.startsWith(OPERATOR_PREFIX)) {
    throw new UserInputError(`Filter value for "${path}" is not allowed`);
  }
};

/** A scalar that is safe to compare a document field against directly. */
const requireScalar = (value, path) => {
  rejectOperators(value, path);
  if (value !== null && typeof value === "object") {
    throw new UserInputError(`Filter "${path}" must be a scalar value`);
  }
  return value;
};

const toObjectId = (value, path) => {
  const raw = requireScalar(value, path);
  if (typeof raw !== "string") {
    throw new UserInputError(`Filter "${path}" must be an id string`);
  }
  if (!mongoose.Types.ObjectId.isValid(raw)) {
    throw new UserInputError(`Filter "${path}" is not a valid id`);
  }
  return new mongoose.Types.ObjectId(raw);
};

/**
 * Legacy id-set filter: the list-detail page sends `{ _id: { $in: [...] } }`.
 * Accepted as a hand-parsed special case (the typed inputs spell it `ids`)
 * so deployed clients keep working through the JSON deprecation window.
 */
const toIdList = (value, path) => {
  const raw = Array.isArray(value) ? value : value?.$in;
  if (!Array.isArray(raw)) {
    throw new UserInputError(`Filter "${path}" must be a list of ids`);
  }
  return raw.map((entry, index) => toObjectId(entry, `${path}[${index}]`));
};

const sensorLabelForKey = (sensorKey, path) => {
  const label = SENSOR_LABELS_BY_KEY[requireScalar(sensorKey, path)];
  if (!label) {
    throw new UserInputError(`Filter "${path}" is not a known sensor`);
  }
  return label;
};

/**
 * Match the sensor the way the FilmSim.compatibleSensors resolver reads it:
 * the current field when it holds anything, the deprecated compatibleCameras
 * field only when it does not.
 */
const sensorClause = (label) => ({
  $or: [
    { compatibleSensors: label },
    {
      compatibleSensors: { $in: [null, []] },
      compatibleCameras: label,
    },
  ],
});

const scalarField = (field) => (value, query, path) => {
  query[field] = requireScalar(value, path);
};

const SHARED_FIELDS = {
  tagId: (value, query, path) => {
    query.tags = { $in: [toObjectId(value, path)] };
  },
  featured: (value, query, path) => {
    const featured = requireScalar(value, path);
    if (typeof featured !== "boolean") {
      throw new UserInputError(`Filter "${path}" must be a boolean`);
    }
    query.featured = featured;
  },
  ids: (value, query, path) => {
    query._id = { $in: toIdList(value, path) };
  },
  // Legacy spelling of `ids`.
  _id: (value, query, path) => {
    query._id = { $in: toIdList(value, path) };
  },
};

const SENSOR_FIELDS = {
  sensorKey: (value, query, path) => {
    Object.assign(query, sensorClause(sensorLabelForKey(value, path)));
  },
  cameraName: (value, query, path) => {
    const camera = findCamera(requireScalar(value, path));
    if (!camera) {
      throw new UserInputError(`Filter "${path}" is not a known camera`);
    }
    Object.assign(query, sensorClause(sensorLabelForKey(camera.sensorKey, path)));
  },
  // Legacy spelling: the sensor display label, matched the same way.
  compatibleSensors: (value, query, path) => {
    Object.assign(query, sensorClause(requireScalar(value, path)));
  },
};

const PRESET_FIELDS = {
  ...SHARED_FIELDS,
  // Retained for the exact-match SEARCH_PRESETS query until the Phase 3
  // `search` argument replaces it.
  title: scalarField("title"),
};

const FILM_SIM_FIELDS = {
  ...SHARED_FIELDS,
  ...SENSOR_FIELDS,
  name: scalarField("name"),
};

const buildQuery = (fields, sources) => {
  const query = {};

  for (const source of sources) {
    if (!source) continue;
    if (typeof source !== "object" || Array.isArray(source)) {
      throw new UserInputError("Filter must be an object");
    }

    for (const [key, value] of Object.entries(source)) {
      if (value === undefined || value === null) continue;
      const apply = fields[key];
      if (!apply) {
        throw new UserInputError(`Unknown filter field "${key}"`);
      }
      apply(value, query, key);
    }
  }

  return query;
};

/** `filter` is the deprecated JSON blob; `where` is the typed input. */
const buildPresetFilterQuery = (filter, where) =>
  buildQuery(PRESET_FIELDS, [filter, where]);

const buildFilmSimFilterQuery = (filter, where) =>
  buildQuery(FILM_SIM_FIELDS, [filter, where]);

module.exports = {
  buildPresetFilterQuery,
  buildFilmSimFilterQuery,
};
