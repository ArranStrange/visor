const mongoose = require("mongoose");
const { UserInputError } = require("./errors");
const { escapeRegExp } = require("./escapeRegExp");
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
 * The legacy JSON argument is accepted for exactly one release, per
 * docs/plans/c1-c3-delivery-plan.md; a dated removal task tracks deleting it.
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
      // `Object.hasOwn`, not truthiness of `fields[key]`: a key inherited from
      // Object.prototype ("constructor", "toString", "__proto__") would
      // otherwise read as a match and be invoked as if it were a field
      // handler. Only keys this map declares itself are filter fields.
      if (!Object.hasOwn(fields, key)) {
        throw new UserInputError(`Unknown filter field "${key}"`);
      }
      fields[key](value, query, key);
    }
  }

  return query;
};

/** `filter` is the deprecated JSON blob; `where` is the typed input. */
const buildPresetFilterQuery = (filter, where) =>
  buildQuery(PRESET_FIELDS, [filter, where]);

const buildFilmSimFilterQuery = (filter, where) =>
  buildQuery(FILM_SIM_FIELDS, [filter, where]);

/* -------------------------------------------------------------------------- */
/* Sorting                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The ContentSort enum, mapped to Mongo sort specs. Every one of these fields
 * is indexed on both Preset and FilmSim.
 *
 * Every order ends in `_id: -1`, which makes each one a total order. Without a
 * unique final key the sort is only a partial order: the hundreds of documents
 * sharing a score of 0 come back in whatever sequence the index scan happens
 * to produce, and skip/limit paging can then repeat or drop items between
 * pages. `createdAt` alone is not enough — two documents written in the same
 * millisecond tie on it too, which is exactly what a seed script or a bulk
 * import produces.
 */
const CONTENT_SORTS = Object.freeze({
  NEWEST: { createdAt: -1, _id: -1 },
  POPULAR: { popularityScore: -1, createdAt: -1, _id: -1 },
  MOST_DOWNLOADED: { downloads: -1, createdAt: -1, _id: -1 },
  MOST_SAVED: { saveCount: -1, createdAt: -1, _id: -1 },
});

const DEFAULT_CONTENT_SORT = "NEWEST";

const buildContentSort = (sort) => {
  if (sort === undefined || sort === null) {
    return CONTENT_SORTS[DEFAULT_CONTENT_SORT];
  }
  // GraphQL validates the enum before we get here; this guards the internal
  // callers (and a JSON `filter` blob) that bypass that validation.
  if (!Object.hasOwn(CONTENT_SORTS, sort)) {
    throw new UserInputError(`Unknown sort "${sort}"`);
  }
  return CONTENT_SORTS[sort];
};

/* -------------------------------------------------------------------------- */
/* Search                                                                     */
/* -------------------------------------------------------------------------- */

const PRESET_SEARCH_FIELDS = ["title", "description", "notes"];
const FILM_SIM_SEARCH_FIELDS = ["name", "description", "notes"];

/**
 * The one predicate every preset listing carries: a preset with no after image
 * has nothing to show in the grid.
 *
 * It lives here rather than in the resolver so the count and the page are built
 * from the same query by construction. The old resolver counted the unfiltered
 * set and then dropped image-less presets in JS *after* paging, so the total
 * disagreed with the grid and a page could come back short (#119).
 */
const PRESET_LIST_BASE = Object.freeze({
  afterImage: { $exists: true, $ne: null },
});

/**
 * Tags whose name or display name matches the search. Presets and film sims
 * store tags as references, so a search for "portra" has to resolve the tag
 * first — the join the grid's users expect when they type a tag name into the
 * search box rather than clicking the chip.
 */
const tagIdsMatching = async (regex) => {
  // Required lazily: contentFilters is imported by the typeDefs contract tests,
  // which must not pull the whole model graph in.
  const Tag = require("../models/Tag");
  const tags = await Tag.find({
    $or: [{ name: regex }, { displayName: regex }],
  })
    .select("_id")
    .lean();

  return tags.map((tag) => tag._id);
};

/**
 * Merge a search `$or` into a query that may already have one of its own (the
 * sensor filter builds an `$or`). Spreading would silently drop the first,
 * turning a sensor-filtered search into an unfiltered one.
 */
const withSearchClause = (query, clause) => {
  if (!clause) return query;
  if (!query.$or) return { ...query, ...clause };

  const { $or, ...rest } = query;
  return { ...rest, $and: [{ $or }, clause] };
};

const buildListQuery = async (fields, searchFields, base, args) => {
  const { filter, where, search } = args ?? {};
  const query = { ...base, ...buildQuery(fields, [filter, where]) };

  const term = typeof search === "string" ? search.trim() : "";
  if (!term) return query;

  const regex = new RegExp(escapeRegExp(term), "i");
  const clauses = searchFields.map((field) => ({ [field]: regex }));

  const tagIds = await tagIdsMatching(regex);
  if (tagIds.length) clauses.push({ tags: { $in: tagIds } });

  return withSearchClause(query, { $or: clauses });
};

/**
 * The full Mongo query for one listPresets call: the validated filters, the
 * always-on after-image predicate, and the search `$or`.
 */
const buildPresetListQuery = (args) =>
  buildListQuery(
    PRESET_FIELDS,
    PRESET_SEARCH_FIELDS,
    PRESET_LIST_BASE,
    args
  );

/**
 * The same for listFilmSims. Note the absence of an image predicate: a recipe
 * is a set of in-camera settings and is useful without a sample photo, so film
 * sims stay listable without images. That asymmetry with presets is deliberate
 * (see the delivery plan) rather than an oversight.
 */
const buildFilmSimListQuery = (args) =>
  buildListQuery(FILM_SIM_FIELDS, FILM_SIM_SEARCH_FIELDS, {}, args);

module.exports = {
  buildPresetFilterQuery,
  buildFilmSimFilterQuery,
  buildPresetListQuery,
  buildFilmSimListQuery,
  buildContentSort,
  CONTENT_SORTS,
  DEFAULT_CONTENT_SORT,
  PRESET_LIST_BASE,
  withSearchClause,
};
