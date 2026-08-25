// Single serializer for the Loadout GraphQL type — isStale is computed
// here and nowhere else, so every resolver returns the same derivation.

const toIso = (d) => (d ? new Date(d).toISOString() : null);

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
    slots: (obj.slots || []).map((slot) => ({
      index: slot.index,
      filmSim: serializeFilmSim(slot.filmSim),
      filmSimName: slot.filmSimName || null,
      note: slot.note || null,
    })),
    // Never keyed in but has slots → stale; keyed in → stale only if
    // slots changed afterwards. A loadout with no slot writes yet is not
    // stale — there is nothing to key in.
    isStale: Boolean(
      slotsChangedAt && (!keyedInAt || slotsChangedAt > keyedInAt)
    ),
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
