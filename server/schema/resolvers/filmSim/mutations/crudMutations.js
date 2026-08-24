const FilmSim = require("../../../../models/FilmSim");
const { createLogger } = require("../../../../utils/logger");
const {
  requireAuth,
  requireOwnership,
} = require("../../../../utils/authHelpers");
const {
  createFilmSimTags,
  slugifyFilmSimName,
  attachFilmSimSampleImages,
} = require("../services/filmSimUpload");

const logger = createLogger("resolvers:filmSim");

module.exports = {
  uploadFilmSim: async (
    _,
    { name, description, tags, settings, notes, sampleImages, compatibleSensors },
    { user }
  ) => {
    requireAuth(user, "You must be logged in to upload a film simulation");

    try {
      const tagIds = await createFilmSimTags(tags);

      const slug = slugifyFilmSimName(name);

      const filmSimData = {
        name,
        slug,
        description,
        compatibleSensors: compatibleSensors || [],
        type: "custom-recipe",
        settings: {
          dynamicRange: settings.dynamicRange || 100,
          highlight: settings.highlight || 0,
          shadow: settings.shadow || 0,
          colour: settings.color || 0,
          sharpness: settings.sharpness || 0,
          noiseReduction: settings.noiseReduction || 0,
          grainEffect: settings.grainEffect || "OFF",
          clarity: settings.clarity || 0,
          whiteBalance: settings.whiteBalance || "auto",
          wbShift: settings.wbShift || { r: 0, b: 0 },
          filmSimulation: settings.filmSimulation || "",
          colorChromeEffect: settings.colorChromeEffect || "OFF",
          colorChromeFxBlue: settings.colorChromeFxBlue || "OFF",
        },
        notes,
        tags: tagIds,
        creator: user._id,
      };

      const filmSim = await FilmSim.create(filmSimData);

      await attachFilmSimSampleImages(filmSim, sampleImages, user, {
        name,
        tags,
      });

      return filmSim;
    } catch (error) {
      logger.error("Error uploading film simulation", error);
      throw new Error("Failed to upload film simulation: " + error.message);
    }
  },

  createFilmSim: async (_, { input }, { user }) => {
    requireAuth(user, "Not authenticated");

    try {
      const { name, description, settings, tags, sampleImages } = input;

      const filmSim = await FilmSim.create({
        name,
        description,
        settings,
        creator: user._id,
        tags,
        sampleImages,
      });

      return filmSim;
    } catch (error) {
      logger.error("Create film simulation error", error);
      throw error;
    }
  },

  updateFilmSim: async (_, { id, input }, { user }) => {
    requireAuth(user, "Not authenticated");

    try {
      const filmSim = await FilmSim.findById(id);
      if (!filmSim) {
        throw new Error("Film simulation not found");
      }

      requireOwnership(user, filmSim, "creator", { allowAdmin: false });

      const updatedFilmSim = await FilmSim.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true }
      );

      return updatedFilmSim;
    } catch (error) {
      logger.error("Update film simulation error", error);
      throw error;
    }
  },

  deleteFilmSim: async (_, { id }, { user }) => {
    requireAuth(user, "Not authenticated");

    try {
      const filmSim = await FilmSim.findById(id);
      if (!filmSim) {
        throw new Error("Film simulation not found");
      }

      requireOwnership(user, filmSim, "creator", { allowAdmin: false });

      await FilmSim.findByIdAndDelete(id);
      return true;
    } catch (error) {
      logger.error("Delete film simulation error", error);
      throw error;
    }
  },
};
