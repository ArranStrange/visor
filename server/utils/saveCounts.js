const { POPULARITY_WEIGHTS } = require("./popularity");

/**
 * Keeps `saveCount` / `popularityScore` in step with UserList membership.
 *
 * The counters have to be adjusted by the number of memberships that actually
 * changed, not by the number of ids the caller sent — otherwise adding a
 * preset that is already in the list inflates its save count every time the
 * "Add to list" dialog is confirmed.
 */

/** Normalise a mixed bag of ObjectIds and id strings for comparison. */
const asKey = (id) => String(id);

/**
 * The subset of `incoming` not already in `current`. Also the fix for a real
 * bug in the old code: it de-duplicated with `new Set([...list.presets,
 * ...presetIds])`, and a Set cannot see that an ObjectId instance and the
 * equivalent id string are the same member, so re-adding an item appended a
 * duplicate.
 */
const membersToAdd = (current, incoming) => {
  const held = new Set((current ?? []).map(asKey));
  const added = [];

  for (const id of incoming ?? []) {
    const key = asKey(id);
    if (held.has(key)) continue;
    held.add(key);
    added.push(id);
  }

  return added;
};

/** True when `id` is currently a member — i.e. removing it changes something. */
const isMember = (current, id) =>
  (current ?? []).some((held) => asKey(held) === asKey(id));

/**
 * Move saveCount and popularityScore by `delta` for every id given. One
 * updateMany, so a list of twenty saves is one write rather than twenty.
 */
const adjustSaveCounts = async (model, ids, delta) => {
  if (!ids?.length || !delta) return 0;

  const result = await model.updateMany(
    { _id: { $in: ids } },
    {
      $inc: {
        saveCount: delta,
        popularityScore: delta * POPULARITY_WEIGHTS.save,
      },
    }
  );

  return result.modifiedCount ?? 0;
};

module.exports = { membersToAdd, isMember, adjustSaveCounts };
