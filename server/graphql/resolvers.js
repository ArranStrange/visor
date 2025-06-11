const FilmSim = require("../models/FilmSim");
const User = require("../models/User");
const {
  AuthenticationError,
  UserInputError,
} = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    filmSims: async (parent, { name }) => {
      const params = name ? { name: { $regex: name, $options: "i" } } : {};
      return FilmSim.find(params).sort({ createdAt: -1 });
    },
    filmSim: async (parent, { filmSimId }) => {
      return FilmSim.findOne({ _id: filmSimId });
    },
    userFilmSims: async (parent, { userId }) => {
      return FilmSim.find({ creator: userId }).sort({ createdAt: -1 });
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("No user found with this email address");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);

      return { token, user };
    },
    addFilmSim: async (parent, { name, description, settings }, context) => {
      if (context.user) {
        const filmSim = await FilmSim.create({
          name,
          description,
          creator: context.user._id,
          // Basic Settings
          version: settings.version,
          processVersion: settings.processVersion,
          whiteBalance: settings.whiteBalance,
          cameraProfile: settings.cameraProfile,
          toneCurveName: settings.toneCurveName,

          // Exposure and Tone
          exposure: settings.exposure,
          contrast: settings.contrast,
          highlights: settings.highlights,
          shadows: settings.shadows,
          whites: settings.whites,
          blacks: settings.blacks,
          texture: settings.texture,
          clarity: settings.clarity,
          dehaze: settings.dehaze,

          // Grain Settings
          grain: settings.grain,

          // Vignette
          vignette: settings.vignette,

          // Color Adjustments
          colorAdjustments: settings.colorAdjustments,

          // Split Toning
          splitToning: settings.splitToning,

          // Tone Curve
          toneCurve: settings.toneCurve,
        });

        return filmSim;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    updateFilmSim: async (
      parent,
      { filmSimId, name, description, settings },
      context
    ) => {
      if (context.user) {
        const filmSim = await FilmSim.findOneAndUpdate(
          { _id: filmSimId, creator: context.user._id },
          {
            name,
            description,
            // Basic Settings
            version: settings.version,
            processVersion: settings.processVersion,
            whiteBalance: settings.whiteBalance,
            cameraProfile: settings.cameraProfile,
            toneCurveName: settings.toneCurveName,

            // Exposure and Tone
            exposure: settings.exposure,
            contrast: settings.contrast,
            highlights: settings.highlights,
            shadows: settings.shadows,
            whites: settings.whites,
            blacks: settings.blacks,
            texture: settings.texture,
            clarity: settings.clarity,
            dehaze: settings.dehaze,

            // Grain Settings
            grain: settings.grain,

            // Vignette
            vignette: settings.vignette,

            // Color Adjustments
            colorAdjustments: settings.colorAdjustments,

            // Split Toning
            splitToning: settings.splitToning,

            // Tone Curve
            toneCurve: settings.toneCurve,
          },
          { new: true }
        );

        if (!filmSim) {
          throw new UserInputError(
            "Film simulation not found or you don't have permission to update it"
          );
        }

        return filmSim;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    removeFilmSim: async (parent, { filmSimId }, context) => {
      if (context.user) {
        const filmSim = await FilmSim.findOneAndDelete({
          _id: filmSimId,
          creator: context.user._id,
        });

        if (!filmSim) {
          throw new UserInputError(
            "Film simulation not found or you don't have permission to delete it"
          );
        }

        return filmSim;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    likeFilmSim: async (parent, { filmSimId }, context) => {
      if (context.user) {
        const filmSim = await FilmSim.findOneAndUpdate(
          { _id: filmSimId },
          { $inc: { likes: 1 } },
          { new: true }
        );

        if (!filmSim) {
          throw new UserInputError("Film simulation not found");
        }

        return filmSim;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    downloadFilmSim: async (parent, { filmSimId }, context) => {
      if (context.user) {
        const filmSim = await FilmSim.findOneAndUpdate(
          { _id: filmSimId },
          { $inc: { downloads: 1 } },
          { new: true }
        );

        if (!filmSim) {
          throw new UserInputError("Film simulation not found");
        }

        return filmSim;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

module.exports = resolvers;
