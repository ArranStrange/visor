const mongoose = require("mongoose");
const { UserInputError } = require("./errors");
const { POPULARITY_WEIGHTS } = require("./popularity");

/**
 * Shared like/unlike for Preset and FilmSim.
 *
 * Both used to be hand-rolled and both were broken: `likeFilmSim` was declared
 * in the schema with no resolver at all (it silently returned null), and
 * `likePreset` did a read-modify-write with no auth check, no null guard and no
 * way to undo (#128).
 *
 * The properties that matter here:
 *  - One atomic `findOneAndUpdate`. The precondition (`likes` does not already
 *    contain the user) is part of the query, so the counter cannot be
 *    incremented twice by two concurrent requests from the same user.
 *  - `likeCount` and `popularityScore` move with the array, in the same write.
 *    They are denormalised precisely so that a sort never has to load it.
 *  - Idempotent: liking twice is a no-op that still reports success, rather
 *    than an error the client has to special-case.
 *  - A malformed or unknown id is a UserInputError, not a CastError leaking
 *    out of Mongoose.
 */

const requireValidId = (id, label) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new UserInputError(`${label} is not a valid id`);
  }
  return id;
};

/**
 * @returns {Promise<boolean>} true once the user's like is recorded (whether
 * this call added it or a previous one did).
 */
const addLike = async (model, id, user, label) => {
  requireValidId(id, label);

  const updated = await model.findOneAndUpdate(
    { _id: id, likes: { $ne: user.id } },
    {
      $addToSet: { likes: user.id },
      $inc: { likeCount: 1, popularityScore: POPULARITY_WEIGHTS.like },
    },
    { new: true }
  );

  if (updated) return true;

  // Nothing matched: either the document is gone, or the user had already
  // liked it. Only the first is an error.
  if (!(await model.exists({ _id: id }))) {
    throw new UserInputError(`${label} not found`);
  }
  return true;
};

/**
 * @returns {Promise<boolean>} true once the user's like is gone (whether this
 * call removed it or it was never there).
 */
const removeLike = async (model, id, user, label) => {
  requireValidId(id, label);

  const updated = await model.findOneAndUpdate(
    { _id: id, likes: user.id },
    {
      $pull: { likes: user.id },
      $inc: { likeCount: -1, popularityScore: -POPULARITY_WEIGHTS.like },
    },
    { new: true }
  );

  if (updated) return true;

  if (!(await model.exists({ _id: id }))) {
    throw new UserInputError(`${label} not found`);
  }
  return true;
};

module.exports = { addLike, removeLike, requireValidId };
