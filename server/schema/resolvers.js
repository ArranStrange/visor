const { GraphQLUpload } = require("graphql-upload-ts");
const GraphQLJSON = require("graphql-type-json");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/jwt");
const {
  AuthenticationError,
  ValidationError,
  UserInputError,
} = require("../utils/errors");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Preset = require("../models/Preset");
const FilmSim = require("../models/FilmSim");
const Comment = require("../models/comment");
const Image = require("../models/Image");
const UserList = require("../models/UserList");
const Tag = require("../models/Tag");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id || user._id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format");
  }
};

const validatePassword = (password) => {
  if (password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    throw new ValidationError(
      "Password must contain at least one uppercase letter"
    );
  }
  if (!/[a-z]/.test(password)) {
    throw new ValidationError(
      "Password must contain at least one lowercase letter"
    );
  }
  if (!/[0-9]/.test(password)) {
    throw new ValidationError("Password must contain at least one number");
  }
};

const validateUsername = (username) => {
  if (username.length < 3) {
    throw new ValidationError("Username must be at least 3 characters long");
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new ValidationError(
      "Username can only contain letters, numbers, and underscores"
    );
  }
};

module.exports = {
  Upload: GraphQLUpload,
  JSON: GraphQLJSON,

  Query: {
    getUser: async (_, { id }) => await User.findById(id),
    getCurrentUser: async (_, __, { user }) =>
      user ? await User.findById(user._id) : null,
    searchUsers: async (_, { query }) =>
      await User.find({ username: new RegExp(query, "i") }),

    getPreset: async (_, { slug }) => await Preset.findOne({ slug }),
    listPresets: async (_, { filter }) =>
      await Preset.find(filter || {}).populate(
        "creator tags filmSim sampleImages"
      ),

    getFilmSim: async (_, { slug }) => await FilmSim.findOne({ slug }),
    listFilmSims: async (_, { filter }) =>
      await FilmSim.find(filter || {}).populate("creator tags"),

    allTags: async () => {
      const tags = await Tag.find({});
      return tags.map((tag) => tag.displayName);
    },

    getImage: async (_, { id }) => await Image.findById(id),
    listImagesByPreset: async (_, { presetId }) =>
      await Image.find({ preset: presetId }),

    getTag: async (_, { name }) => await Tag.findOne({ name }),
    listTags: async (_, { category }) =>
      await Tag.find(category ? { category } : {}),

    getUserLists: async (_, { userId }) =>
      await UserList.find({ owner: userId }),
    getUserList: async (_, { id }) => await UserList.findById(id),

    getCommentsForPreset: async (_, { presetId }) =>
      await Comment.find({ preset: presetId, parent: null }),

    getCommentsForFilmSim: async (_, { filmSimId }) =>
      await Comment.find({ filmSim: filmSimId, parent: null }),
  },

  Mutation: {
    login: async (_, { email, password }) => {
      try {
        // Validate input
        if (!email || !password) {
          throw new UserInputError("Email and password are required");
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
          throw new AuthenticationError("Invalid email or password");
        }

        // Verify password using the model's method
        const isValid = await user.comparePassword(password);
        if (!isValid) {
          throw new AuthenticationError("Invalid email or password");
        }

        console.log("Login successful for user:", user);
        const token = generateToken(user);
        console.log("Generated token:", token);

        return {
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
          },
        };
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },

    register: async (_, { username, email, password }) => {
      try {
        // Validate input
        validateEmail(email);
        validatePassword(password);
        validateUsername(username);

        // Check for existing user
        const existingUser = await User.findOne({
          $or: [{ email }, { username }],
        });
        if (existingUser) {
          if (existingUser.email === email) {
            throw new UserInputError("Email already in use");
          }
          if (existingUser.username === username) {
            throw new UserInputError("Username already taken");
          }
        }

        // Create user
        const user = await User.create({
          username,
          email,
          password,
        });

        // Generate token and return
        return {
          token: generateToken(user),
          user,
        };
      } catch (error) {
        if (
          error instanceof ValidationError ||
          error instanceof UserInputError
        ) {
          throw error;
        }
        throw new Error("An error occurred during registration");
      }
    },

    createPreset: async (_, { input }, { user }) => {
      const preset = new Preset({ ...input, creator: user.id });
      return await preset.save();
    },

    updatePreset: async (_, { id, input }) =>
      await Preset.findByIdAndUpdate(id, input, { new: true }),

    deletePreset: async (_, { id }) => !!(await Preset.findByIdAndDelete(id)),

    likePreset: async (_, { presetId }, { user }) => {
      const preset = await Preset.findById(presetId);
      if (!preset.likes.includes(user.id)) {
        preset.likes.push(user.id);
        await preset.save();
      }
      return true;
    },

    downloadPreset: async (_, { presetId }) => {
      const preset = await Preset.findById(presetId);
      preset.downloads += 1;
      await preset.save();
      return true;
    },

    createFilmSim: async (_, { input }, { user }) => {
      const filmSim = new FilmSim({ ...input, creator: user.id });
      return await filmSim.save();
    },

    updateFilmSim: async (_, { id, input }) =>
      await FilmSim.findByIdAndUpdate(id, input, { new: true }),

    deleteFilmSim: async (_, { id }) => !!(await FilmSim.findByIdAndDelete(id)),

    likeFilmSim: async (_, { filmSimId }, { user }) => {
      const sim = await FilmSim.findById(filmSimId);
      if (!sim.likes.includes(user.id)) {
        sim.likes.push(user.id);
        await sim.save();
      }
      return true;
    },

    createComment: async (_, { input }, { user }) => {
      const comment = new Comment({ ...input, author: user.id });
      return await comment.save();
    },

    reactToComment: async (_, { commentId, reaction }, { user }) => {
      const comment = await Comment.findById(commentId);
      comment.reactions[reaction] = comment.reactions[reaction] || [];
      if (!comment.reactions[reaction].includes(user.id)) {
        comment.reactions[reaction].push(user.id);
        await comment.save();
      }
      return comment;
    },

    deleteComment: async (_, { id }, { user }) => {
      const comment = await Comment.findById(id);
      if (comment.author.toString() === user.id.toString()) {
        await Comment.findByIdAndDelete(id);
        return true;
      }
      return false;
    },
  },

  Preset: {
    creator: async (preset) => await User.findById(preset.creator),
    tags: async (preset) => await Tag.find({ _id: { $in: preset.tags } }),
    filmSim: async (preset) => await FilmSim.findById(preset.filmSim),
    sampleImages: async (preset) =>
      await Image.find({ _id: { $in: preset.sampleImages } }),
  },

  FilmSim: {
    creator: async (sim) => await User.findById(sim.creator),
    tags: async (sim) => await Tag.find({ _id: { $in: sim.tags } }),
    recommendedPresets: async (sim) =>
      await Preset.find({ _id: { $in: sim.recommendedPresets } }),
    sampleImages: async (sim) =>
      await Image.find({ _id: { $in: sim.sampleImages } }),
  },

  Comment: {
    author: async (comment) => await User.findById(comment.author),
    parent: async (comment) =>
      comment.parent ? await Comment.findById(comment.parent) : null,
  },
};
