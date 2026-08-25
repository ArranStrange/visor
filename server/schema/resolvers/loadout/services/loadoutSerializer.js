// Single serializer for the Loadout GraphQL type — isStale is computed
// here and nowhere else, so every resolver returns the same derivation.

const { settingsEqual } = require("./settingsSnapshot");

const toIso = (d) => (d ? new Date(d).toISOString() : null);

// Staleness has two independent causes, reported by precedence:
// SLOTS_CHANGED (the user edited the loadout after keying it in — they
// know about it, they did it) wins over SOURCE_CHANGED (a recipe author
// changed a recipe under them — the surprising one).
const deriveStaleness = (slots, keyedInAt, slotsChangedAt) => {
  const slotsChanged = Boolean(
    slotsChangedAt && (!keyedInAt || slotsChangedAt > keyedInAt)
  );
  const sourceChanged = slots.some((slot) => slot.sourceChanged);
  return {
    isStale: slotsChanged || sourceChanged,
    staleReason: slotsChanged
      ? "SLOTS_CHANGED"
      : sourceChanged
        ? "SOURCE_CHANGED"
        : null,
  };
};

const serializeLoadout = (loadout) => {
  const obj = loadout.toObject();
  const keyedInAt = obj.keyedInAt || null;
  const slotsChangedAt = obj.slotsChangedAt || null;

  // toObject() drops the `id` virtual on populated subdocuments, so every
  // nested _id must be mapped explicitly — including sampleImages, whose
  // Image type declares id as non-nullable.
  const serializeFilmSim = (filmSim) =>
    filmSim && filmSim._id
      ? {
          ...filmSim,
          id: filmSim._id.toString(),
          sampleImages: (filmSim.sampleImages || []).map((img) => ({
            ...img,
            id: img._id.toString(),
          })),
        }
      : null;

  const { _id, __v, ...rest } = obj;

  const slots = (obj.slots || []).map((slot) => ({
    index: slot.index,
    filmSim: serializeFilmSim(slot.filmSim),
    filmSimName: slot.filmSimName || null,
    note: slot.note || null,
    // SOURCE_CHANGED (#101): the recipe author edited the recipe after
    // this slot was keyed in — the camera silently holds old values.
    // Only meaningful when a keyed-in snapshot exists and the recipe is
    // still populated to compare against.
    sourceChanged: Boolean(
      slot.keyedInSettings &&
        slot.filmSim &&
        slot.filmSim.settings &&
        !settingsEqual(slot.keyedInSettings, slot.filmSim.settings)
    ),
  }));

  return {
    ...rest,
    id: _id.toString(),
    owner: obj.owner && obj.owner._id
      ? {
          id: obj.owner._id.toString(),
          username: obj.owner.username,
          avatar: obj.owner.avatar,
        }
      : obj.owner,
    slots,
    // Never keyed in but has slots → stale; keyed in → stale only if
    // slots changed afterwards or a source recipe changed underneath.
    // A loadout with no slot writes yet is not stale.
    ...deriveStaleness(slots, keyedInAt, slotsChangedAt),
    keyedInAt: toIso(keyedInAt),
    slotsChangedAt: toIso(slotsChangedAt),
    createdAt: toIso(obj.createdAt),
    updatedAt: toIso(obj.updatedAt),
  };
};

// One populate shape for every read: the slot detail screen needs the full
// settings payload, so slots.filmSim carries settings and a thumbnail.
const LOADOUT_POPULATE = [
  { path: "owner", select: "id username avatar" },
  {
    path: "slots.filmSim",
    select: "id name slug settings thumbnail compatibleSensors sampleImages",
    populate: { path: "sampleImages", select: "id url" },
  },
];

module.exports = { serializeLoadout, LOADOUT_POPULATE };
