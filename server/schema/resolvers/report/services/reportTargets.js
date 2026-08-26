const Discussion = require("../../../../models/Discussion");
const FilmSim = require("../../../../models/FilmSim");
const Image = require("../../../../models/Image");
const Preset = require("../../../../models/Preset");

/**
 * Does the reported thing actually exist?
 *
 * Without this, a report is just a pair of strings: the queue fills with rows
 * pointing at nothing and a moderator cannot tell a deleted item from a typed
 * id. Discussion posts are subdocuments, so they are found by matching inside
 * the parent's posts array rather than by a collection lookup.
 */
const EXISTS_BY_TARGET_TYPE = {
  PRESET: (targetId) => Preset.exists({ _id: targetId }),
  FILMSIM: (targetId) => FilmSim.exists({ _id: targetId }),
  IMAGE: (targetId) => Image.exists({ _id: targetId }),
  DISCUSSION_POST: (targetId) => Discussion.exists({ "posts._id": targetId }),
};

const targetExists = async (targetType, targetId) => {
  const lookup = EXISTS_BY_TARGET_TYPE[targetType];
  // Unreachable through GraphQL — the enum rejects anything else — but a
  // missing branch here must fail closed rather than wave the report through.
  if (!lookup) return false;

  return Boolean(await lookup(targetId));
};

module.exports = { targetExists };
