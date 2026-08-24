const FilmSim = require("../../../../models/FilmSim");
const Preset = require("../../../../models/Preset");
const { AuthenticationError, UserInputError } = require("../../../../utils/errors");
const { createLogger } = require("../../../../utils/logger");
const {
  requireAuth,
  requireOwnership,
} = require("../../../../utils/authHelpers");
const { populateFilmSim } = require("../services/populateFilmSim");

const logger = createLogger("resolvers:filmSim");

module.exports = {
  addRecommendedPreset: async (_, { filmSimId, presetId }, { user }) => {
    requireAuth(user, "Not authenticated");

    try {
      const filmSim = await FilmSim.findById(filmSimId);
      if (!filmSim) {
        throw new Error("Film simulation not found");
      }

      requireOwnership(user, filmSim, "creator", {
        allowAdmin: false,
        message: "Not authorized to modify this film simulation",
      });

      const preset = await Preset.findById(presetId);
      if (!preset) {
        throw new Error("Preset not found");
      }

      if (filmSim.recommendedPresets.includes(presetId)) {
        throw new Error("Preset is already in recommended presets");
      }

      filmSim.recommendedPresets.push(presetId);
      await filmSim.save();

      return await populateFilmSim(FilmSim.findById(filmSimId));
    } catch (error) {
      logger.error("Add recommended preset error", error);
      throw error;
    }
  },

  removeRecommendedPreset: async (_, { filmSimId, presetId }, { user }) => {
    requireAuth(user, "Not authenticated");

    try {
      const filmSim = await FilmSim.findById(filmSimId);
      if (!filmSim) {
        throw new Error("Film simulation not found");
      }

      requireOwnership(user, filmSim, "creator", {
        allowAdmin: false,
        message: "Not authorized to modify this film simulation",
      });

      const presetIndex = filmSim.recommendedPresets.indexOf(presetId);
      if (presetIndex === -1) {
        throw new Error("Preset is not in recommended presets");
      }

      filmSim.recommendedPresets.splice(presetIndex, 1);
      await filmSim.save();

      return await populateFilmSim(FilmSim.findById(filmSimId));
    } catch (error) {
      logger.error("Remove recommended preset error", error);
      throw error;
    }
  },

  makeFilmSimFeatured: async (_, { filmSimId }, { user }) => {
    requireAuth(user, "You must be logged in");

    if (!user.isAdmin) {
      throw new AuthenticationError(
        "Only administrators can feature film sims"
      );
    }

    try {
      // First, unfeature all other film sims
      await FilmSim.updateMany(
        { _id: { $ne: filmSimId } },
        { $set: { featured: false } }
      );

      const filmSim = await FilmSim.findById(filmSimId);
      if (!filmSim) {
        throw new UserInputError("Film sim not found");
      }

      filmSim.featured = true;
      await filmSim.save();

      return filmSim;
    } catch (error) {
      logger.error("Make film sim featured error", error);
      throw new Error("Failed to feature film sim");
    }
  },

  removeFilmSimFeatured: async (_, { filmSimId }, { user }) => {
    requireAuth(user, "You must be logged in");

    if (!user.isAdmin) {
      throw new AuthenticationError(
        "Only administrators can remove featured status"
      );
    }

    try {
      const filmSim = await FilmSim.findById(filmSimId);
      if (!filmSim) {
        throw new UserInputError("Film sim not found");
      }

      filmSim.featured = false;
      await filmSim.save();

      return filmSim;
    } catch (error) {
      logger.error("Remove film sim featured error", error);
      throw new Error("Failed to remove featured status");
    }
  },
};
