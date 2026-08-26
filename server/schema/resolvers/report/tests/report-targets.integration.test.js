const assert = require("node:assert/strict");
const { test, before, after, beforeEach } = require("node:test");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const Discussion = require("../../../../models/Discussion");
const FilmSim = require("../../../../models/FilmSim");
const Image = require("../../../../models/Image");
const Preset = require("../../../../models/Preset");
const User = require("../../../../models/User");
const { targetExists, targetUrl } = require("../services/reportTargets");
const { FIXTURE_PASSWORD } = require("../../../../test-support/fixtures");

// The queue is only useful if a moderator can get from a row to the thing it
// is about. Reports store an id, the routes are keyed by slug, so the link has
// to be resolved server-side — and must degrade to null, not to a broken link,
// once the content is gone.

let mongod;
let counter = 0;

const createUser = () => {
  counter += 1;
  return User.create({
    username: `member${counter}`,
    email: `member${counter}@visor.test`,
    password: FIXTURE_PASSWORD,
  });
};

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
    User.deleteMany({}),
    Preset.deleteMany({}),
    FilmSim.deleteMany({}),
    Image.deleteMany({}),
    Discussion.deleteMany({}),
  ]);
});

test("a preset resolves to its detail route", async () => {
  const creator = await createUser();
  const preset = await Preset.create({
    title: "Muted Greens",
    slug: "muted-greens",
    creator: creator._id,
  });

  assert.equal(await targetExists("PRESET", preset._id), true);
  assert.equal(await targetUrl("PRESET", preset._id), "/preset/muted-greens");
});

test("a film sim resolves to its detail route", async () => {
  const creator = await createUser();
  const filmSim = await FilmSim.create({
    name: "Kodachrome 64",
    slug: "kodachrome-64",
    description: "Warm, punchy, slightly green shadows.",
    creator: creator._id,
  });

  assert.equal(await targetExists("FILMSIM", filmSim._id), true);
  assert.equal(await targetUrl("FILMSIM", filmSim._id), "/filmsim/kodachrome-64");
});

test("an image resolves to its own hosted file", async () => {
  const uploader = await createUser();
  const preset = await Preset.create({
    title: "Muted Greens",
    slug: "muted-greens-3",
    creator: uploader._id,
  });
  const image = await Image.create({
    url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    publicId: "sample",
    uploader: uploader._id,
    associatedWith: { kind: "Preset", item: preset._id },
  });

  assert.equal(await targetExists("IMAGE", image._id), true);
  // There is no page that shows one image on its own, so the file itself is
  // the honest destination.
  assert.equal(
    await targetUrl("IMAGE", image._id),
    "https://res.cloudinary.com/demo/image/upload/sample.jpg"
  );
});

test("a discussion post resolves to the discussion that contains it", async () => {
  const author = await createUser();
  const preset = await Preset.create({
    title: "Muted Greens",
    slug: "muted-greens-2",
    creator: author._id,
  });
  const discussion = await Discussion.create({
    title: "About this preset",
    linkedTo: { type: "preset", refId: preset._id },
    createdBy: author._id,
    posts: [{ userId: author._id, username: author.username, content: "Hi" }],
  });
  const postId = discussion.posts[0]._id;

  assert.equal(await targetExists("DISCUSSION_POST", postId), true);
  assert.equal(
    await targetUrl("DISCUSSION_POST", postId),
    `/discussions/${discussion._id}`
  );
});

test("deleted content has no link and does not exist", async () => {
  const missing = new mongoose.Types.ObjectId();

  for (const targetType of ["PRESET", "FILMSIM", "IMAGE", "DISCUSSION_POST"]) {
    assert.equal(await targetExists(targetType, missing), false, targetType);
    assert.equal(await targetUrl(targetType, missing), null, targetType);
  }
});

test("an unknown target type fails closed", async () => {
  // Unreachable through GraphQL, but a missing branch must not wave a report
  // through or invent a link.
  assert.equal(await targetExists("USER", new mongoose.Types.ObjectId()), false);
  assert.equal(await targetUrl("USER", new mongoose.Types.ObjectId()), null);
});
