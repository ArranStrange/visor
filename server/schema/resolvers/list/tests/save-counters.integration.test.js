// config/jwt exits the process when JWT_SECRET is unset, and the resolver
// module graph pulls it in at require time — so this has to be set first.
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-not-for-real-use";

const assert = require("node:assert/strict");
const { test, before, after, beforeEach } = require("node:test");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const FilmSim = require("../../../../models/FilmSim");
const Preset = require("../../../../models/Preset");
// Registers the Image model, which the list serialiser populates through.
require("../../../../models/Image");
const User = require("../../../../models/User");
const UserList = require("../../../../models/UserList");
const mutations = require("../mutations");
const { FIXTURE_PASSWORD } = require("../../../../test-support/fixtures");

// saveCount feeds the MOST_SAVED sort and popularityScore feeds POPULAR, and
// neither is ever recomputed from the lists — so a drift between the
// membership arrays and the counters is only visible as a wrong ordering.

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

const createList = (owner) =>
  UserList.create({ name: "Favourites", owner: owner._id });

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
    UserList.deleteMany({}),
    User.deleteMany({}),
  ]);
});

test("adding to a list counts the save on both content types", async () => {
  const user = await createUser();
  const [preset, filmSim, list] = [
    await createPreset(user),
    await createFilmSim(user),
    await createList(user),
  ];

  await mutations.addToUserList(
    null,
    {
      listId: list._id.toString(),
      presetIds: [preset._id.toString()],
      filmSimIds: [filmSim._id.toString()],
    },
    ctx(user)
  );

  const storedPreset = await Preset.findById(preset._id);
  const storedFilmSim = await FilmSim.findById(filmSim._id);

  assert.equal(storedPreset.saveCount, 1);
  assert.equal(storedPreset.popularityScore, 2);
  assert.equal(storedFilmSim.saveCount, 1);
  assert.equal(storedFilmSim.popularityScore, 2);
});

test("re-adding the same preset neither duplicates it nor counts twice", async () => {
  const user = await createUser();
  const preset = await createPreset(user);
  const list = await createList(user);
  const args = {
    listId: list._id.toString(),
    presetIds: [preset._id.toString()],
  };

  await mutations.addToUserList(null, args, ctx(user));
  await mutations.addToUserList(null, args, ctx(user));

  const storedList = await UserList.findById(list._id);
  const storedPreset = await Preset.findById(preset._id);

  assert.equal(storedList.presets.length, 1);
  assert.equal(storedPreset.saveCount, 1);
  assert.equal(storedPreset.popularityScore, 2);
});

test("removing from a list gives the save back", async () => {
  const user = await createUser();
  const preset = await createPreset(user);
  const list = await createList(user);

  await mutations.addToUserList(
    null,
    { listId: list._id.toString(), presetIds: [preset._id.toString()] },
    ctx(user)
  );
  await mutations.removeFromUserList(
    null,
    { listId: list._id.toString(), presetId: preset._id.toString() },
    ctx(user)
  );

  const storedPreset = await Preset.findById(preset._id);
  assert.equal(storedPreset.saveCount, 0);
  assert.equal(storedPreset.popularityScore, 0);
});

test("removing something that was never in the list does not go negative", async () => {
  const user = await createUser();
  const preset = await createPreset(user);
  const list = await createList(user);

  await mutations.removeFromUserList(
    null,
    { listId: list._id.toString(), presetId: preset._id.toString() },
    ctx(user)
  );

  const storedPreset = await Preset.findById(preset._id);
  assert.equal(storedPreset.saveCount, 0);
  assert.equal(storedPreset.popularityScore, 0);
});

test("two different lists each count as a save", async () => {
  const user = await createUser();
  const preset = await createPreset(user);
  const [first, second] = [await createList(user), await createList(user)];

  for (const list of [first, second]) {
    await mutations.addToUserList(
      null,
      { listId: list._id.toString(), presetIds: [preset._id.toString()] },
      ctx(user)
    );
  }

  const storedPreset = await Preset.findById(preset._id);
  assert.equal(storedPreset.saveCount, 2);
  assert.equal(storedPreset.popularityScore, 4);
});

test("deleting a whole list gives back every save it held", async () => {
  // Without this the counters keep ranking content nobody has saved any more:
  // delete a list of twenty and twenty saveCounts stay inflated.
  const user = await createUser();
  const [presetA, presetB, filmSim, list] = [
    await createPreset(user),
    await createPreset(user),
    await createFilmSim(user),
    await createList(user),
  ];

  await mutations.addToUserList(
    null,
    {
      listId: list._id.toString(),
      presetIds: [presetA._id.toString(), presetB._id.toString()],
      filmSimIds: [filmSim._id.toString()],
    },
    ctx(user)
  );

  assert.equal((await Preset.findById(presetA._id)).saveCount, 1);
  assert.equal((await Preset.findById(presetB._id)).saveCount, 1);
  assert.equal((await FilmSim.findById(filmSim._id)).saveCount, 1);

  await mutations.deleteUserList(null, { id: list._id.toString() }, ctx(user));

  const [reloadedA, reloadedB, reloadedSim] = await Promise.all([
    Preset.findById(presetA._id),
    Preset.findById(presetB._id),
    FilmSim.findById(filmSim._id),
  ]);

  assert.equal(reloadedA.saveCount, 0, "every held preset is given back");
  assert.equal(reloadedB.saveCount, 0);
  assert.equal(reloadedSim.saveCount, 0, "and every held film sim");
  assert.equal(reloadedA.popularityScore, 0, "the ranking score comes down too");
  assert.equal(reloadedSim.popularityScore, 0);
});

test("deleting an empty list touches no counters", async () => {
  const user = await createUser();
  const preset = await createPreset(user);
  const list = await createList(user);

  await mutations.deleteUserList(null, { id: list._id.toString() }, ctx(user));

  assert.equal((await Preset.findById(preset._id)).saveCount, 0);
});

test("deleting one list leaves another list's saves alone", async () => {
  const user = await createUser();
  const preset = await createPreset(user);
  const kept = await createList(user);
  const removed = await createList(user);

  for (const list of [kept, removed]) {
    await mutations.addToUserList(
      null,
      { listId: list._id.toString(), presetIds: [preset._id.toString()] },
      ctx(user)
    );
  }
  assert.equal((await Preset.findById(preset._id)).saveCount, 2);

  await mutations.deleteUserList(null, { id: removed._id.toString() }, ctx(user));

  assert.equal(
    (await Preset.findById(preset._id)).saveCount,
    1,
    "the surviving list still counts"
  );
});
