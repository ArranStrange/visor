// Pure slot-merge logic for setLoadoutSlots, extracted for offline testing.
//
// Input semantics (documented on LoadoutSlotInput):
//   - { index, filmSimId }  → assign that recipe to the bank
//   - { index }             → PRESERVE whatever the server holds at that
//                             bank. This is what keeps a dangling
//                             filmSimName snapshot alive when the client
//                             echoes back a slot whose recipe was deleted —
//                             the client can never supply a name itself,
//                             so it can't manufacture snapshots.
//   - index omitted from the array → the bank becomes empty.
//
// Throws plain Error with a user-safe message; the resolver wraps it in
// UserInputError.

const validateSlotInputs = (slots, customBanks) => {
  const indices = slots.map((s) => s.index);
  if (new Set(indices).size !== indices.length) {
    throw new Error("Slot indices must be unique");
  }
  for (const i of indices) {
    if (!Number.isInteger(i) || i < 0 || i >= customBanks) {
      throw new Error(
        `Slot index ${i} is outside this body's C1–C${customBanks} banks`
      );
    }
  }
};

/**
 * Build the next slots array from the input entries and the existing
 * persisted slots. nameById maps accessible film sim ids to names.
 */
const mergeSlots = (inputs, existingSlots, nameById) => {
  const existingByIndex = new Map(existingSlots.map((s) => [s.index, s]));

  return inputs.map((input) => {
    if (input.filmSimId) {
      const name = nameById.get(input.filmSimId.toLowerCase());
      if (!name) {
        throw new Error(`Film sim ${input.filmSimId} not found`);
      }
      return {
        index: input.index,
        filmSim: input.filmSimId,
        filmSimName: name,
        note: input.note ?? null,
      };
    }

    // No filmSimId: preserve the existing bank contents (reference AND
    // name snapshot), taking only the note from the input.
    const existing = existingByIndex.get(input.index);
    return {
      index: input.index,
      filmSim: existing?.filmSim ?? null,
      filmSimName: existing?.filmSimName ?? null,
      note: input.note ?? existing?.note ?? null,
    };
  });
};

module.exports = { validateSlotInputs, mergeSlots };
