// config/jwt exits the process when JWT_SECRET is unset, and the resolver
// module graph pulls it in at require time — so this has to be set first.
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-not-for-real-use";

const assert = require("node:assert/strict");
const { test, before, after, beforeEach } = require("node:test");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const FilmSim = require("../../../../models/FilmSim");
const Image = require("../../../../models/Image");
const Preset = require("../../../../models/Preset");
const Tag = require("../../../../models/Tag");
const User = require("../../../../models/User");
// Registers the Comment model, which populateFilmSim traverses.
require("../../../../models/Comment");
const presetQueries = require("../queries");
const filmSimQueries = require("../../filmSim/queries");
const { FIXTURE_PASSWORD } = require("../../../../test-support/fixtures");

// Search and sort go through the same validated builder as the filters, and
// the query object is shared by the count and the page — these tests exercise
// the parts that only appear once documents round-trip through Mongo: regex
// escaping against real data, each sort order's ordering, the tag-name join,
// and the count/page agreement that #119 was about.

let mongod;
let counter = 0;
let owner;

const createUser = () => {
  counter += 1;
  return User.create({
    username: `member${counter}`,
    email: `member${counter}@visor.test`,
    password: FIXTURE_PASSWORD,
    emailVerified: true,
  });
};

const createImage = () =>
  Image.create({
    url: `https://images.test/${(counter += 1)}.jpg`,
    publicId: `img-${counter}`,
    uploader: owner._id,
    // Required by the model; the preset does not exist yet when the image is
    // created, and nothing under test reads back through this association.
    associatedWith: { kind: "Preset", item: new mongoose.Types.ObjectId() },
  });

/** A listable preset: `withImage: false` makes it invisible to the grid. */
const createPreset = async (overrides = {}, { withImage = true } = {}) => {
  counter += 1;
  const image = withImage ? await createImage() : null;
  return Preset.create({
    title: `Preset ${counter}`,
    slug: `preset-${counter}`,
    creator: owner._id,
    afterImage: image?._id,
    ...overrides,
  });
};

const createFilmSim = (overrides = {}) => {
  counter += 1;
  return FilmSim.create({
    name: `Film sim ${counter}`,
    slug: `film-sim-${counter}`,
    description: "A recipe",
    creator: owner._id,
    ...overrides,
  });
};

const listPresets = (args = {}) =>
  presetQueries.listPresets(null, { page: 1, limit: 20, ...args });

const listFilmSims = (args = {}) =>
  filmSimQueries.listFilmSims(null, { page: 1, limit: 20, ...args });

const titles = (result) => result.presets.map((preset) => preset.title);
const names = (result) => result.filmSims.map((filmSim) => filmSim.name);

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await Promise.all([
    Preset.deleteMany({}),
    FilmSim.deleteMany({}),
    Image.deleteMany({}),
    Tag.deleteMany({}),
    User.deleteMany({}),
  ]);
  owner = await createUser();
});

/* -------------------------------------------------------------------------- */
/* search                                                                     */
/* -------------------------------------------------------------------------- */

test("search matches the title case-insensitively", async () => {
  await createPreset({ title: "Muted Greens" });
  await createPreset({ title: "Warm Portrait" });

  assert.deepEqual(titles(await listPresets({ search: "muted" })), [
    "Muted Greens",
  ]);
});

test("search also covers description and notes", async () => {
  await createPreset({ title: "One", description: "soft rolling highlights" });
  await createPreset({ title: "Two", notes: "shot on Portra" });
  await createPreset({ title: "Three" });

  assert.deepEqual(titles(await listPresets({ search: "rolling" })), ["One"]);
  assert.deepEqual(titles(await listPresets({ search: "portra" })), ["Two"]);
});

test("search joins through tag names", async () => {
  const tag = await Tag.create({
    name: "cinematic",
    displayName: "Cinematic",
    category: "preset",
  });
  await createPreset({ title: "Tagged", tags: [tag._id] });
  await createPreset({ title: "Untagged" });

  assert.deepEqual(titles(await listPresets({ search: "cinemat" })), [
    "Tagged",
  ]);
});

test("regex metacharacters are matched literally, not as a pattern", async () => {
  // Unescaped, ".*" matches every preset and "(" throws outright.
  await createPreset({ title: "Kodak (Gold)" });
  await createPreset({ title: "Fuji Superia" });

  assert.deepEqual(titles(await listPresets({ search: ".*" })), []);
  assert.deepEqual(titles(await listPresets({ search: "(Gold)" })), [
    "Kodak (Gold)",
  ]);
});

test("a pathological pattern cannot be smuggled in", async () => {
  await createPreset({ title: "Plain" });

  // Would be a catastrophic-backtracking regex if it reached the engine
  // unescaped; escaped it is simply a string nothing contains.
  const result = await listPresets({ search: "(a+)+$" });
  assert.deepEqual(titles(result), []);
  assert.equal(result.totalCount, 0);
});

test("an operator-shaped search term is data, not a query", async () => {
  await createPreset({ title: "Plain" });

  const result = await listPresets({ search: '{"$ne": null}' });
  assert.equal(result.totalCount, 0);
});

test("a blank search is the same as no search", async () => {
  await createPreset({ title: "One" });
  await createPreset({ title: "Two" });

  assert.equal((await listPresets({ search: "   " })).totalCount, 2);
  assert.equal((await listPresets({ search: "" })).totalCount, 2);
});

test("search narrows the total count as well as the page", async () => {
  await createPreset({ title: "Muted Greens" });
  await createPreset({ title: "Warm Portrait" });

  const result = await listPresets({ search: "muted" });
  assert.equal(result.totalCount, 1);
  assert.equal(result.presets.length, 1);
});

test("film sims search over name, description and notes", async () => {
  await createFilmSim({ name: "Classic Chrome Punch" });
  await createFilmSim({ name: "Soft Acros", notes: "high contrast look" });

  assert.deepEqual(names(await listFilmSims({ search: "punch" })), [
    "Classic Chrome Punch",
  ]);
  assert.deepEqual(names(await listFilmSims({ search: "contrast" })), [
    "Soft Acros",
  ]);
});

test("a sensor filter and a search both apply", async () => {
  // Both build an `$or`; if they were merged by spreading, one would be lost
  // and the sensor filter would silently stop filtering.
  await createFilmSim({
    name: "Fits Portra",
    compatibleSensors: ["X-Trans V"],
  });
  await createFilmSim({
    name: "Also Portra",
    compatibleSensors: ["X-Trans III"],
  });

  const result = await listFilmSims({
    where: { sensorKey: "x-trans-v" },
    search: "portra",
  });

  assert.deepEqual(names(result), ["Fits Portra"]);
  assert.equal(result.totalCount, 1);
});

/* -------------------------------------------------------------------------- */
/* sort                                                                       */
/* -------------------------------------------------------------------------- */

test("NEWEST is the default and puts the most recent first", async () => {
  await createPreset({ title: "Older", createdAt: new Date("2020-01-01") });
  await createPreset({ title: "Newer", createdAt: new Date("2024-01-01") });

  assert.deepEqual(titles(await listPresets()), ["Newer", "Older"]);
  assert.deepEqual(titles(await listPresets({ sort: "NEWEST" })), [
    "Newer",
    "Older",
  ]);
});

test("POPULAR orders by popularityScore", async () => {
  await createPreset({ title: "Low", popularityScore: 1 });
  await createPreset({ title: "High", popularityScore: 40 });
  await createPreset({ title: "Middle", popularityScore: 12 });

  assert.deepEqual(titles(await listPresets({ sort: "POPULAR" })), [
    "High",
    "Middle",
    "Low",
  ]);
});

test("MOST_DOWNLOADED orders by downloads", async () => {
  await createPreset({ title: "Few", downloads: 2 });
  await createPreset({ title: "Many", downloads: 90 });

  assert.deepEqual(titles(await listPresets({ sort: "MOST_DOWNLOADED" })), [
    "Many",
    "Few",
  ]);
});

test("MOST_SAVED orders by saveCount", async () => {
  await createPreset({ title: "Rarely saved", saveCount: 1 });
  await createPreset({ title: "Often saved", saveCount: 30 });

  assert.deepEqual(titles(await listPresets({ sort: "MOST_SAVED" })), [
    "Often saved",
    "Rarely saved",
  ]);
});

test("a tied score falls back to newest, so paging stays stable", async () => {
  await createPreset({
    title: "Older tie",
    popularityScore: 5,
    createdAt: new Date("2020-01-01"),
  });
  await createPreset({
    title: "Newer tie",
    popularityScore: 5,
    createdAt: new Date("2024-01-01"),
  });

  assert.deepEqual(titles(await listPresets({ sort: "POPULAR" })), [
    "Newer tie",
    "Older tie",
  ]);
});

test("film sims honour the same sorts", async () => {
  await createFilmSim({ name: "Quiet", popularityScore: 0 });
  await createFilmSim({ name: "Loud", popularityScore: 20 });

  assert.deepEqual(names(await listFilmSims({ sort: "POPULAR" })), [
    "Loud",
    "Quiet",
  ]);
});

test("an unknown sort is an error, not a silent default", async () => {
  await assert.rejects(() => listPresets({ sort: "TRENDING" }), /Unknown sort/);
});

/* -------------------------------------------------------------------------- */
/* afterImage: count and page agreement (#119)                                */
/* -------------------------------------------------------------------------- */

test("presets without an after image are excluded from the count too", async () => {
  await createPreset({ title: "Shown A" });
  await createPreset({ title: "Shown B" });
  await createPreset({ title: "Hidden" }, { withImage: false });

  const result = await listPresets();

  assert.deepEqual(titles(result).sort(), ["Shown A", "Shown B"]);
  // The old resolver counted 3 here and rendered 2.
  assert.equal(result.totalCount, 2);
});

test("a full page is a full page, not one short", async () => {
  // The old resolver paged first and dropped image-less presets afterwards, so
  // a page containing one could come back short while claiming more remained.
  for (let index = 0; index < 4; index += 1) {
    await createPreset({ title: `Visible ${index}` });
    await createPreset({ title: `Invisible ${index}` }, { withImage: false });
  }

  const firstPage = await presetQueries.listPresets(null, {
    page: 1,
    limit: 2,
  });
  const secondPage = await presetQueries.listPresets(null, {
    page: 2,
    limit: 2,
  });

  assert.equal(firstPage.presets.length, 2);
  assert.equal(secondPage.presets.length, 2);
  assert.equal(firstPage.totalCount, 4);
  assert.equal(firstPage.totalPages, 2);
  assert.equal(firstPage.hasNextPage, true);
  assert.equal(secondPage.hasNextPage, false);
});

test("film sims stay listable without an image", async () => {
  // The deliberate asymmetry: a recipe is a set of in-camera settings and is
  // useful without a sample photo.
  await createFilmSim({ name: "No photo" });

  const result = await listFilmSims();
  assert.deepEqual(names(result), ["No photo"]);
  assert.equal(result.totalCount, 1);
});

test("search and sort compose with paging", async () => {
  await createPreset({ title: "Portra warm", popularityScore: 1 });
  await createPreset({ title: "Portra cool", popularityScore: 9 });
  await createPreset({ title: "Ektar", popularityScore: 99 });

  const result = await listPresets({
    search: "portra",
    sort: "POPULAR",
    limit: 1,
  });

  assert.deepEqual(titles(result), ["Portra cool"]);
  assert.equal(result.totalCount, 2);
  assert.equal(result.hasNextPage, true);
});

test("paging is stable when counters and timestamps all tie", async () => {
  // The case a createdAt tiebreak does not cover: a bulk import writes several
  // documents in the same millisecond with the same score. Without a unique
  // final sort key the order is whatever the index scan produces, and paging
  // through one at a time can then repeat or drop items.
  const sameInstant = new Date("2026-01-01T00:00:00.000Z");
  const identical = [];
  for (let i = 0; i < 6; i += 1) {
    identical.push(
      await createPreset({
        popularityScore: 0,
        saveCount: 0,
        downloads: 0,
        createdAt: sameInstant,
      })
    );
  }
  const expectedIds = new Set(identical.map((preset) => preset._id.toString()));

  for (const sort of ["POPULAR", "MOST_SAVED", "MOST_DOWNLOADED", "NEWEST"]) {
    const seen = [];
    for (let page = 1; page <= 6; page += 1) {
      const result = await presetQueries.listPresets(null, {
        page,
        limit: 1,
        sort,
      });
      seen.push(...result.presets.map((preset) => preset.id.toString()));
    }

    const unique = new Set(seen);
    assert.equal(
      unique.size,
      seen.length,
      `${sort} returned a duplicate across pages: ${seen.join(", ")}`
    );
    assert.equal(seen.length, 6, `${sort} dropped an item while paging`);
    assert.deepEqual(unique, expectedIds, `${sort} paged over the wrong set`);
  }
});
