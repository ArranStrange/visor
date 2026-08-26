// config/jwt exits the process when JWT_SECRET is unset, and the resolver
// module graph pulls it in at require time — so this has to be set first.
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-not-for-real-use";

const assert = require("node:assert/strict");
const { test, before, after, beforeEach } = require("node:test");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const FilmSim = require("../../../../models/FilmSim");
const Preset = require("../../../../models/Preset");
const User = require("../../../../models/User");
const presetMutations = require("../mutations");
const filmSimMutations = require("../../filmSim/mutations");
const { FIXTURE_PASSWORD } = require("../../../../test-support/fixtures");

// The counters are the whole point of these resolvers: a POPULAR sort reads
// popularityScore, never the arrays, so an $inc that drifts from the array it
// is meant to shadow is invisible until the ordering is wrong. These tests
// assert the array and the counters after every path.

let mongod;
let counter = 0;

const ctx = (user) => ({ user });

const createUser = () => {
  counter += 1;
  return User.create({
    username: `member${counter}`,
    email: `member${counter}@visor.test`,
    password: FIXTURE_PASSWORD,
    emailVerified: true,
  });
};

const createPreset = (creator) =>
  Preset.create({
    title: "Muted Greens",
    slug: `muted-greens-${(counter += 1)}`,
    creator: creator._id,
  });

const createFilmSim = (creator) =>
  FilmSim.create({
    name: "Kodachrome 64",
    slug: `kodachrome-64-${(counter += 1)}`,
    description: "Warm, punchy",
    creator: creator._id,
  });

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
    User.deleteMany({}),
  ]);
});

test("likePreset records the user and moves both counters", async () => {
  const user = await createUser();
  const preset = await createPreset(user);

  assert.equal(
    await presetMutations.likePreset(
      null,
      { presetId: preset._id.toString() },
      ctx(user)
    ),
    true
  );

  const stored = await Preset.findById(preset._id);
  assert.deepEqual(
    stored.likes.map((id) => id.toString()),
    [user._id.toString()]
  );
  assert.equal(stored.likeCount, 1);
  assert.equal(stored.popularityScore, 1);
});

test("liking twice is idempotent — the counter does not double", async () => {
  const user = await createUser();
  const preset = await createPreset(user);
  const args = { presetId: preset._id.toString() };

  await presetMutations.likePreset(null, args, ctx(user));
  await presetMutations.likePreset(null, args, ctx(user));

  const stored = await Preset.findById(preset._id);
  assert.equal(stored.likes.length, 1);
  assert.equal(stored.likeCount, 1);
  assert.equal(stored.popularityScore, 1);
});

test("unlikePreset undoes exactly one like", async () => {
  const [one, two] = [await createUser(), await createUser()];
  const preset = await createPreset(one);
  const args = { presetId: preset._id.toString() };

  await presetMutations.likePreset(null, args, ctx(one));
  await presetMutations.likePreset(null, args, ctx(two));
  await presetMutations.unlikePreset(null, args, ctx(one));

  const stored = await Preset.findById(preset._id);
  assert.deepEqual(
    stored.likes.map((id) => id.toString()),
    [two._id.toString()]
  );
  assert.equal(stored.likeCount, 1);
  assert.equal(stored.popularityScore, 1);
});

test("unliking something never liked does not push the counter negative", async () => {
  const user = await createUser();
  const preset = await createPreset(user);

  await presetMutations.unlikePreset(
    null,
    { presetId: preset._id.toString() },
    ctx(user)
  );

  const stored = await Preset.findById(preset._id);
  assert.equal(stored.likeCount, 0);
  assert.equal(stored.popularityScore, 0);
});

test("likePreset requires a signed-in user", async () => {
  const user = await createUser();
  const preset = await createPreset(user);

  await assert.rejects(
    () =>
      presetMutations.likePreset(
        null,
        { presetId: preset._id.toString() },
        ctx(null)
      ),
    /logged in/
  );
});

test("likePreset reports a missing preset instead of throwing a TypeError", async () => {
  const user = await createUser();

  await assert.rejects(
    () =>
      presetMutations.likePreset(
        null,
        { presetId: new mongoose.Types.ObjectId().toString() },
        ctx(user)
      ),
    /not found/
  );
});

test("a malformed id is a user error, not a CastError", async () => {
  const user = await createUser();

  await assert.rejects(
    () => presetMutations.likePreset(null, { presetId: "nope" }, ctx(user)),
    /not a valid id/
  );
});

test("likeFilmSim has a resolver at all, and it counts", async () => {
  // The regression: the field was declared in the schema and merged into no
  // resolver map, so it silently resolved to null (#128).
  const user = await createUser();
  const filmSim = await createFilmSim(user);
  const args = { filmSimId: filmSim._id.toString() };

  assert.equal(typeof filmSimMutations.likeFilmSim, "function");
  assert.equal(await filmSimMutations.likeFilmSim(null, args, ctx(user)), true);

  const stored = await FilmSim.findById(filmSim._id);
  assert.deepEqual(
    stored.likes.map((id) => id.toString()),
    [user._id.toString()]
  );
  assert.equal(stored.likeCount, 1);
  assert.equal(stored.popularityScore, 1);
});

test("unlikeFilmSim reverses it", async () => {
  const user = await createUser();
  const filmSim = await createFilmSim(user);
  const args = { filmSimId: filmSim._id.toString() };

  await filmSimMutations.likeFilmSim(null, args, ctx(user));
  await filmSimMutations.unlikeFilmSim(null, args, ctx(user));

  const stored = await FilmSim.findById(filmSim._id);
  assert.deepEqual(stored.likes, []);
  assert.equal(stored.likeCount, 0);
  assert.equal(stored.popularityScore, 0);
});

test("likeFilmSim requires a signed-in user", async () => {
  const user = await createUser();
  const filmSim = await createFilmSim(user);

  await assert.rejects(
    () =>
      filmSimMutations.likeFilmSim(
        null,
        { filmSimId: filmSim._id.toString() },
        ctx(null)
      ),
    /logged in/
  );
});

test("a film sim serialises its likes as a list", async () => {
  // The original bug: `likes` was a Number while the schema advertised
  // [User], so anything that selected it threw "Expected Iterable".
  const user = await createUser();
  const filmSim = await createFilmSim(user);
  await filmSimMutations.likeFilmSim(
    null,
    { filmSimId: filmSim._id.toString() },
    ctx(user)
  );

  const stored = await FilmSim.findById(filmSim._id).lean();
  assert.ok(Array.isArray(stored.likes));
});

test("downloadPreset increments downloads by one and the score by three", async () => {
  const user = await createUser();
  const preset = await createPreset(user);

  await presetMutations.downloadPreset(
    null,
    { presetId: preset._id.toString() },
    ctx(user)
  );

  const stored = await Preset.findById(preset._id);
  assert.equal(stored.downloads, 1);
  assert.equal(stored.popularityScore, 3);
});

test("downloadPreset rejects a missing preset rather than throwing on null", async () => {
  // The old read-modify-write did `preset.downloads += 1` on undefined.
  const user = await createUser();

  await assert.rejects(
    () =>
      presetMutations.downloadPreset(
        null,
        { presetId: new mongoose.Types.ObjectId().toString() },
        ctx(user)
      ),
    /not found/
  );
});

test("downloadPreset requires a signed-in user", async () => {
  const user = await createUser();
  const preset = await createPreset(user);

  await assert.rejects(
    () =>
      presetMutations.downloadPreset(
        null,
        { presetId: preset._id.toString() },
        ctx(null)
      ),
    /logged in/
  );
});

test("a like and a download compose into one score", async () => {
  const user = await createUser();
  const preset = await createPreset(user);
  const args = { presetId: preset._id.toString() };

  await presetMutations.likePreset(null, args, ctx(user));
  await presetMutations.downloadPreset(null, args, ctx(user));

  const stored = await Preset.findById(preset._id);
  assert.equal(stored.popularityScore, 4);
});
