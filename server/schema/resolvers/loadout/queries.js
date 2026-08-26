const { ApolloError } = require("apollo-server-express");
const { isValidObjectId } = require("mongoose");
const Loadout = require("../../../models/Loadout");
const { normalizeCameraName } = require("../../../constants/fujifilmCameras");
const { requireAuth } = require("../../../utils/authHelpers");
const { createLogger } = require("../../../utils/logger");
const {
  serializeLoadout,
  LOADOUT_POPULATE,
} = require("./services/loadoutSerializer");

const logger = createLogger("resolvers:loadout");

module.exports = {
  getMyLoadouts: async (_, { camera }, { user }) => {
    requireAuth(user, "You must be logged in to view your loadouts");

    try {
      const filter = { owner: user._id };
      if (camera) filter.cameraKey = normalizeCameraName(camera);

      const loadouts = await Loadout.find(filter)
        .sort({ isActive: -1, updatedAt: -1 })
        .populate(LOADOUT_POPULATE);

      return loadouts.map(serializeLoadout);
    } catch (error) {
      logger.error("Error fetching loadouts", error);
      throw new ApolloError("Failed to fetch loadouts", "INTERNAL_SERVER_ERROR");
    }
  },

  getLoadout: async (_, { id }, { user }) => {
    requireAuth(user, "You must be logged in to view a loadout");
    if (!isValidObjectId(id)) return null;

    try {
      // Owner-scoped in the query itself — a non-owner gets null, not a
      // distinguishable "exists but forbidden".
      const loadout = await Loadout.findOne({
        _id: id,
        owner: user._id,
      }).populate(LOADOUT_POPULATE);

      return loadout ? serializeLoadout(loadout) : null;
    } catch (error) {
      logger.error("Error fetching loadout", error);
      throw new ApolloError("Failed to fetch loadout", "INTERNAL_SERVER_ERROR");
    }
  },

  getActiveLoadout: async (_, { camera }, { user }) => {
    requireAuth(user, "You must be logged in to view your active loadout");

    try {
      const loadout = await Loadout.findOne({
        owner: user._id,
        cameraKey: normalizeCameraName(camera),
        isActive: true,
      }).populate(LOADOUT_POPULATE);

      return loadout ? serializeLoadout(loadout) : null;
    } catch (error) {
      logger.error("Error fetching active loadout", error);
      throw new ApolloError(
        "Failed to fetch active loadout",
        "INTERNAL_SERVER_ERROR"
      );
    }
  },
};
