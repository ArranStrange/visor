const assert = require("node:assert/strict");
const test = require("node:test");

const { serializeLoadout } = require("../loadoutSerializer");

// Stub of a populated mongoose doc: toObject() output with ObjectId-like
// nested _ids, exactly the shape the serializer receives.
const oid = (hex) => ({ toString: () => hex });

const baseObj = () => ({
  _id: oid("111111111111111111111111"),
  __v: 0,
  name: "Lisbon, May",
  camera: "X-T5",
  cameraKey: "xt5",
  customBanks: 7,
  isActive: true,
  keyedInAt: null,
  slotsChangedAt: null,
  createdAt: new Date("2026-08-01T00:00:00Z"),
  updatedAt: new Date("2026-08-02T00:00:00Z"),
  owner: {
    _id: oid("222222222222222222222222"),
    username: "arran",
    avatar: "a.jpg",
  },
  slots: [
    {
      index: 0,
      filmSim: {
        _id: oid("333333333333333333333333"),
        name: "Everyday Chrome",
        slug: "everyday-chrome",
        sampleImages: [{ _id: oid("444444444444444444444444"), url: "s.jpg" }],
      },
      filmSimName: "Everyday Chrome",
      note: null,
    },
    { index: 3, filmSim: null, filmSimName: "Blue Hour", note: null },
  ],
});

const stub = (overrides = {}) => ({
  toObject: () => ({ ...baseObj(), ...overrides }),
});

test("every nested id is a string — including sampleImages", () => {
  const out = serializeLoadout(stub());
  assert.equal(out.id, "111111111111111111111111");
  assert.equal(out.owner.id, "222222222222222222222222");
  assert.equal(out.slots[0].filmSim.id, "333333333333333333333333");
  // The Image GraphQL type declares id non-nullable; toObject() drops the
  // virtual, so the serializer must map it.
  assert.equal(out.slots[0].filmSim.sampleImages[0].id, "444444444444444444444444");
});

test("raw mongo internals do not leak into the response", () => {
  const out = serializeLoadout(stub());
  assert.equal(out._id, undefined);
  assert.equal(out.__v, undefined);
});

test("a dangling slot keeps its name with a null reference", () => {
  const out = serializeLoadout(stub());
  assert.equal(out.slots[1].filmSim, null);
  assert.equal(out.slots[1].filmSimName, "Blue Hour");
});

test("isStale derivation: no slot writes yet → not stale", () => {
  const out = serializeLoadout(stub());
  assert.equal(out.isStale, false);
});

test("isStale derivation: slots written, never keyed in → stale", () => {
  const out = serializeLoadout(
    stub({ slotsChangedAt: new Date("2026-08-03T00:00:00Z") })
  );
  assert.equal(out.isStale, true);
});

test("isStale derivation: keyed in after the last slot write → not stale", () => {
  const out = serializeLoadout(
    stub({
      slotsChangedAt: new Date("2026-08-03T00:00:00Z"),
      keyedInAt: new Date("2026-08-04T00:00:00Z"),
    })
  );
  assert.equal(out.isStale, false);
});

test("isStale derivation: slots changed after keying in → stale again", () => {
  const out = serializeLoadout(
    stub({
      slotsChangedAt: new Date("2026-08-05T00:00:00Z"),
      keyedInAt: new Date("2026-08-04T00:00:00Z"),
    })
  );
  assert.equal(out.isStale, true);
});

test("timestamps serialize as ISO strings", () => {
  const out = serializeLoadout(
    stub({ keyedInAt: new Date("2026-08-04T00:00:00Z") })
  );
  assert.equal(out.keyedInAt, "2026-08-04T00:00:00.000Z");
  assert.equal(out.createdAt, "2026-08-01T00:00:00.000Z");
});

// ---- SOURCE_CHANGED staleness (#101) ----

const liveSettings = {
  filmSimulation: "CLASSIC CHROME",
  dynamicRange: 400,
  highlight: -1,
  wbShift: { r: 3, b: -2 },
};

const withSnapshot = (keyedInSettings, settings = liveSettings) =>
  stub({
    keyedInAt: new Date("2026-08-04T00:00:00Z"),
    slotsChangedAt: new Date("2026-08-03T00:00:00Z"),
    slots: [
      {
        index: 0,
        filmSim: {
          _id: oid("333333333333333333333333"),
          name: "Everyday Chrome",
          slug: "everyday-chrome",
          settings,
          sampleImages: [],
        },
        filmSimName: "Everyday Chrome",
        keyedInSettings,
        note: null,
      },
    ],
  });

test("matching keyed-in snapshot → current, no stale reason", () => {
  const out = serializeLoadout(withSnapshot({ ...liveSettings }));
  assert.equal(out.slots[0].sourceChanged, false);
  assert.equal(out.isStale, false);
  assert.equal(out.staleReason, null);
});

test("recipe edited after keying in → SOURCE_CHANGED", () => {
  const out = serializeLoadout(
    withSnapshot({ ...liveSettings, highlight: 2 })
  );
  assert.equal(out.slots[0].sourceChanged, true);
  assert.equal(out.isStale, true);
  assert.equal(out.staleReason, "SOURCE_CHANGED");
});

test("no snapshot yet → sourceChanged false regardless of settings", () => {
  const out = serializeLoadout(withSnapshot(null));
  assert.equal(out.slots[0].sourceChanged, false);
  assert.equal(out.staleReason, null);
});

test("SLOTS_CHANGED takes precedence over SOURCE_CHANGED", () => {
  const doc = withSnapshot({ ...liveSettings, highlight: 2 });
  const obj = doc.toObject();
  obj.slotsChangedAt = new Date("2026-08-05T00:00:00Z"); // after keyedInAt
  const out = serializeLoadout({ toObject: () => obj });
  assert.equal(out.isStale, true);
  assert.equal(out.staleReason, "SLOTS_CHANGED");
});

test("keyedInSettings never leaks into the serialized slot", () => {
  const out = serializeLoadout(withSnapshot({ ...liveSettings }));
  assert.equal(out.slots[0].keyedInSettings, undefined);
});
