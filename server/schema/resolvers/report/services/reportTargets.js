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

/**
 * Where a moderator goes to look at the reported thing.
 *
 * Resolved here rather than built on the client because the routes are keyed
 * by slug and a report only stores an id — the client has no way to turn one
 * into the other. Null means the content is gone, which is itself the answer
 * to "what am I looking at": nothing, dismiss it.
 *
 * Presets, film sims and discussions resolve to in-app paths; an image
 * resolves to its own hosted URL, since there is no page that shows one image
 * on its own.
 */
const URL_BY_TARGET_TYPE = {
  PRESET: async (targetId) => {
    const preset = await Preset.findById(targetId).select("slug");
    return preset?.slug ? `/preset/${preset.slug}` : null;
  },
  FILMSIM: async (targetId) => {
    const filmSim = await FilmSim.findById(targetId).select("slug");
    return filmSim?.slug ? `/filmsim/${filmSim.slug}` : null;
  },
  IMAGE: async (targetId) => {
    const image = await Image.findById(targetId).select("url");
    return image?.url || null;
  },
  DISCUSSION_POST: async (targetId) => {
    const discussion = await Discussion.findOne({
      "posts._id": targetId,
    }).select("_id");
    return discussion ? `/discussions/${discussion._id}` : null;
  },
};

const targetUrl = async (targetType, targetId) => {
  const resolve = URL_BY_TARGET_TYPE[targetType];
  if (!resolve || !targetId) return null;

  return resolve(targetId);
};

module.exports = { targetExists, targetUrl };
