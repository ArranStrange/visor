const assert = require("node:assert/strict");
const { test, before, after, beforeEach } = require("node:test");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const Loadout = require("../../../../models/Loadout");
const FilmSim = require("../../../../models/FilmSim");
const User = require("../../../../models/User");
// Registers the Image schema — LOADOUT_POPULATE's sampleImages path
// resolves it by name.
require("../../../../models/Image");
const mutations = require("../mutations");
const queries = require("../queries");

// Resolver-level integration tests (#99) against an in-memory MongoDB —
// the layer the offline unit tests can't reach: populate paths, the
// partial unique index backstop, and cross-document effects.

let mongod;
let owner;
let otherUser;

const ctx = (user) => ({ user });

const createFilmSim = (overrides = {}) =>
  FilmSim.create({
    name: "Everyday Chrome",
    slug: `everyday-chrome-${Math.random().toString(36).slice(2)}`,
    description: "test recipe",
    creator: owner._id,
    settings: { filmSimulation: "CLASSIC CHROME", highlight: -1 },
    ...overrides,
  });

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  // The partial unique index is the activation backstop under test —
  // make sure it exists before anything runs.
  await Loadout.init();
  owner = await User.create({
    username: "arran",
    email: "arran@example.com",
    password: "irrelevant-hash",
  });
  otherUser = await User.create({
    username: "someone",
    email: "someone@example.com",
    password: "irrelevant-hash",
  });
});

after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await Loadout.deleteMany({});
  await FilmSim.deleteMany({});
});

test("createLoadout: first loadout for a body auto-activates, second doesn't", async () => {
  const first = await mutations.createLoadout(
    null,
    { input: { name: "Lisbon", camera: "Fujifilm X-T5" } },
    ctx(owner)
  );
  assert.equal(first.isActive, true);
  assert.equal(first.camera, "X-T5"); // canonical display name stored
  assert.equal(first.customBanks, 7);

  const second = await mutations.createLoadout(
    null,
    { input: { name: "Winter", camera: "X-T5" } },
    ctx(owner)
  );
  assert.equal(second.isActive, false);
});

test("createLoadout: E11000 on a racing first-create retries inactive", async () => {
  // Deterministically simulate the race: an active loadout exists, but
  // the existence check reports none — exactly what the loser of two
  // concurrent first-creates observes.
  await mutations.createLoadout(
    null,
    { input: { name: "Existing", camera: "X-T5" } },
    ctx(owner)
  );
  const realExists = Loadout.exists.bind(Loadout);
  Loadout.exists = async () => null;
  try {
    const raced = await mutations.createLoadout(
      null,
      { input: { name: "Racer", camera: "X-T5" } },
      ctx(owner)
    );
    assert.equal(raced.isActive, false); // fell back after E11000
  } finally {
    Loadout.exists = realExists;
  }
  const actives = await Loadout.countDocuments({
    owner: owner._id,
    cameraKey: "xt5",
    isActive: true,
  });
  assert.equal(actives, 1);
});

test("setLoadoutSlots: end-to-end preserve of a dangling snapshot across a later write", async () => {
  const sim = await createFilmSim();
  const loadout = await mutations.createLoadout(
    null,
    { input: { name: "Lisbon", camera: "X-T5" } },
    ctx(owner)
  );

  await mutations.setLoadoutSlots(
    null,
    { id: loadout.id, slots: [{ index: 2, filmSimId: sim._id.toString() }] },
    ctx(owner)
  );
  await FilmSim.findByIdAndDelete(sim._id); // recipe vanishes; C3 stays keyed

  // Later write to a DIFFERENT bank echoes C3 back without a filmSimId.
  const sim2 = await createFilmSim({ name: "Harsh Noon" });
  const updated = await mutations.setLoadoutSlots(
    null,
    {
      id: loadout.id,
      slots: [{ index: 2 }, { index: 4, filmSimId: sim2._id.toString() }],
    },
    ctx(owner)
  );

  const c3 = updated.slots.find((s) => s.index === 2);
  assert.equal(c3.filmSim, null); // deleted recipe
  assert.equal(c3.filmSimName, "Everyday Chrome"); // snapshot survived
  assert.equal(updated.slots.find((s) => s.index === 4).filmSimName, "Harsh Noon");
});

test("setLoadoutSlots: another user's private film sim is rejected; own private is fine", async () => {
  const foreignPrivate = await createFilmSim({
    name: "Secret",
    creator: otherUser._id,
    isPublic: false,
  });
  const ownPrivate = await createFilmSim({
    name: "Mine",
    creator: owner._id,
    isPublic: false,
  });
  const loadout = await mutations.createLoadout(
    null,
    { input: { name: "Lisbon", camera: "X-T5" } },
    ctx(owner)
  );

  await assert.rejects(
    () =>
      mutations.setLoadoutSlots(
        null,
        {
          id: loadout.id,
          slots: [{ index: 0, filmSimId: foreignPrivate._id.toString() }],
        },
        ctx(owner)
      ),
    /not found/
  );

  const ok = await mutations.setLoadoutSlots(
    null,
    { id: loadout.id, slots: [{ index: 0, filmSimId: ownPrivate._id.toString() }] },
    ctx(owner)
  );
  assert.equal(ok.slots[0].filmSimName, "Mine");
});

test("setLoadoutSlots: non-owner cannot write", async () => {
  const loadout = await mutations.createLoadout(
    null,
    { input: { name: "Lisbon", camera: "X-T5" } },
    ctx(owner)
  );
  await assert.rejects(
    () =>
      mutations.setLoadoutSlots(
        null,
        { id: loadout.id, slots: [] },
        ctx(otherUser)
      ),
    /permission/
  );
});

test("setActiveLoadout: activating one deactivates its siblings, exactly one active", async () => {
  const a = await mutations.createLoadout(
    null,
    { input: { name: "A", camera: "X-T5" } },
    ctx(owner)
  );
  const b = await mutations.createLoadout(
    null,
    { input: { name: "B", camera: "X-T5" } },
    ctx(owner)
  );
  assert.equal(a.isActive, true);

  const activated = await mutations.setActiveLoadout(
    null,
    { id: b.id },
    ctx(owner)
  );
  assert.equal(activated.isActive, true);

  const actives = await Loadout.find({
    owner: owner._id,
    cameraKey: "xt5",
    isActive: true,
  });
  assert.equal(actives.length, 1);
  assert.equal(actives[0]._id.toString(), b.id);
});

test("renameLoadout never bumps slotsChangedAt (a rename is not staleness)", async () => {
  const sim = await createFilmSim();
  const loadout = await mutations.createLoadout(
    null,
    { input: { name: "Lisbon", camera: "X-T5" } },
    ctx(owner)
  );
  const written = await mutations.setLoadoutSlots(
    null,
    { id: loadout.id, slots: [{ index: 0, filmSimId: sim._id.toString() }] },
    ctx(owner)
  );

  const renamed = await mutations.renameLoadout(
    null,
    { id: loadout.id, name: "Lisbon, May" },
    ctx(owner)
  );
  assert.equal(renamed.name, "Lisbon, May");
  assert.equal(renamed.slotsChangedAt, written.slotsChangedAt);
});

test("markLoadoutKeyedIn snapshots settings; a later recipe edit → SOURCE_CHANGED (#101)", async () => {
  const sim = await createFilmSim();
  const loadout = await mutations.createLoadout(
    null,
    { input: { name: "Lisbon", camera: "X-T5" } },
    ctx(owner)
  );
  await mutations.setLoadoutSlots(
    null,
    { id: loadout.id, slots: [{ index: 0, filmSimId: sim._id.toString() }] },
    ctx(owner)
  );

  const keyed = await mutations.markLoadoutKeyedIn(
    null,
    { id: loadout.id },
    ctx(owner)
  );
  assert.equal(keyed.isStale, false);
  assert.equal(keyed.staleReason, null);
  assert.equal(keyed.slots[0].sourceChanged, false);

  // The author edits the recipe under the loadout.
  await FilmSim.findByIdAndUpdate(sim._id, {
    $set: { "settings.highlight": 3 },
  });

  const after = await queries.getLoadout(null, { id: loadout.id }, ctx(owner));
  assert.equal(after.slots[0].sourceChanged, true);
  assert.equal(after.isStale, true);
  assert.equal(after.staleReason, "SOURCE_CHANGED");
});

test("getLoadout is owner-scoped: a non-owner gets null, not an error", async () => {
  const loadout = await mutations.createLoadout(
    null,
    { input: { name: "Lisbon", camera: "X-T5" } },
    ctx(owner)
  );
  assert.equal(await queries.getLoadout(null, { id: loadout.id }, ctx(otherUser)), null);
  assert.equal(await queries.getLoadout(null, { id: "not-an-id" }, ctx(owner)), null);
});

test("echoing untouched banks (as the client does) never wipes their keyed-in snapshots", async () => {
  const sim1 = await createFilmSim({ name: "Chrome" });
  const sim2 = await createFilmSim({ name: "Noon" });
  const loadout = await mutations.createLoadout(
    null,
    { input: { name: "Lisbon", camera: "X-T5" } },
    ctx(owner)
  );
  await mutations.setLoadoutSlots(
    null,
    {
      id: loadout.id,
      slots: [
        { index: 0, filmSimId: sim1._id.toString() },
        { index: 1, filmSimId: sim2._id.toString() },
      ],
    },
    ctx(owner)
  );
  await mutations.markLoadoutKeyedIn(null, { id: loadout.id }, ctx(owner));

  // The author edits sim1 under the loadout, then the user edits ONLY
  // slot 1's note — echoing filmSimId for both banks, exactly what the
  // wallet's full-array replace sends.
  await FilmSim.findByIdAndUpdate(sim1._id, {
    $set: { "settings.highlight": 3 },
  });
  const updated = await mutations.setLoadoutSlots(
    null,
    {
      id: loadout.id,
      slots: [
        { index: 0, filmSimId: sim1._id.toString() },
        { index: 1, filmSimId: sim2._id.toString(), note: "midday only" },
      ],
    },
    ctx(owner)
  );

  // Slot 0's SOURCE_CHANGED signal survived the unrelated write...
  assert.equal(updated.slots[0].sourceChanged, true);
  // ...and since no assignment changed, the note-only write isn't
  // SLOTS_CHANGED either — the source change stays the reported reason.
  assert.equal(updated.staleReason, "SOURCE_CHANGED");
});

test("a real reassignment still wipes the snapshot and reports SLOTS_CHANGED", async () => {
  const sim1 = await createFilmSim({ name: "Chrome" });
  const sim2 = await createFilmSim({ name: "Noon" });
  const loadout = await mutations.createLoadout(
    null,
    { input: { name: "Lisbon", camera: "X-T5" } },
    ctx(owner)
  );
  await mutations.setLoadoutSlots(
    null,
    { id: loadout.id, slots: [{ index: 0, filmSimId: sim1._id.toString() }] },
    ctx(owner)
  );
  await mutations.markLoadoutKeyedIn(null, { id: loadout.id }, ctx(owner));

  const updated = await mutations.setLoadoutSlots(
    null,
    { id: loadout.id, slots: [{ index: 0, filmSimId: sim2._id.toString() }] },
    ctx(owner)
  );
  assert.equal(updated.slots[0].sourceChanged, false); // fresh assignment
  assert.equal(updated.staleReason, "SLOTS_CHANGED");
});

test("markLoadoutKeyedIn never rewrites a dangling slot's stored reference", async () => {
  const sim = await createFilmSim();
  const simId = sim._id.toString();
  const loadout = await mutations.createLoadout(
    null,
    { input: { name: "Lisbon", camera: "X-T5" } },
    ctx(owner)
  );
  await mutations.setLoadoutSlots(
    null,
    { id: loadout.id, slots: [{ index: 0, filmSimId: simId }] },
    ctx(owner)
  );
  await FilmSim.findByIdAndDelete(sim._id);

  const keyed = await mutations.markLoadoutKeyedIn(
    null,
    { id: loadout.id },
    ctx(owner)
  );
  // The attestation must not erase the ref: if the recipe is ever
  // restored, the slot reconnects.
  const raw = await Loadout.findById(loadout.id);
  assert.equal(raw.slots[0].filmSim?.toString(), simId);
  // And the response still renders the dangling name.
  assert.equal(keyed.slots[0].filmSimName, "Everyday Chrome");
});

test("keyedInSettings never leaks through the mutation response", async () => {
  const sim = await createFilmSim();
  const loadout = await mutations.createLoadout(
    null,
    { input: { name: "Lisbon", camera: "X-T5" } },
    ctx(owner)
  );
  await mutations.setLoadoutSlots(
    null,
    { id: loadout.id, slots: [{ index: 0, filmSimId: sim._id.toString() }] },
    ctx(owner)
  );
  const keyed = await mutations.markLoadoutKeyedIn(
    null,
    { id: loadout.id },
    ctx(owner)
  );
  assert.equal(keyed.slots[0].keyedInSettings, undefined);
});

test("DR-Auto (null) round-trips the snapshot and compares correctly", async () => {
  const sim = await createFilmSim({
    name: "Auto DR",
    settings: { filmSimulation: "PROVIA", dynamicRange: null },
  });
  const loadout = await mutations.createLoadout(
    null,
    { input: { name: "Lisbon", camera: "X-T5" } },
    ctx(owner)
  );
  await mutations.setLoadoutSlots(
    null,
    { id: loadout.id, slots: [{ index: 0, filmSimId: sim._id.toString() }] },
    ctx(owner)
  );
  const keyed = await mutations.markLoadoutKeyedIn(
    null,
    { id: loadout.id },
    ctx(owner)
  );
  assert.equal(keyed.slots[0].sourceChanged, false);

  // Author later pins a numeric DR — must read as a source change.
  await FilmSim.findByIdAndUpdate(sim._id, {
    $set: { "settings.dynamicRange": 400 },
  });
  const after = await queries.getLoadout(null, { id: loadout.id }, ctx(owner));
  assert.equal(after.slots[0].sourceChanged, true);
});
