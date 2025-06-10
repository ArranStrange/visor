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
const path = require("path");
const fs = require("fs");

const User = require("../models/User");
const Preset = require("../models/Preset");
const FilmSim = require("../models/FilmSim");
const Comment = require("../models/comment");
const Image = require("../models/Image");
const UserList = require("../models/UserList");
const Tag = require("../models/Tag");

// Helper function to handle file uploads
const handleFileUpload = async (file, directory) => {
  const { createReadStream, filename, mimetype } = await file;

  // Create directory if it doesn't exist
  const uploadDir = path.join(__dirname, "..", "uploads", directory);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Generate unique filename
  const uniqueFilename = `${Date.now()}-${filename}`;
  const filepath = path.join(uploadDir, uniqueFilename);

  // Create write stream
  const writeStream = fs.createWriteStream(filepath);

  // Pipe the file to the write stream
  await new Promise((resolve, reject) => {
    createReadStream()
      .pipe(writeStream)
      .on("finish", resolve)
      .on("error", reject);
  });

  // Return the relative path to the file
  return `/${directory}/${uniqueFilename}`;
};

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
    listPresets: async (_, { filter }) => {
      try {
        const presets = await Preset.find(filter || {})
          .populate({
            path: "creator",
            select: "id username avatar",
          })
          .populate({
            path: "tags",
            select: "id name displayName",
          })
          .populate({
            path: "filmSim",
            select: "id name slug",
          })
          .populate({
            path: "sampleImages",
            select: "id url caption",
          });
        return presets;
      } catch (error) {
        console.error("Error listing presets:", error);
        throw new Error("Failed to list presets: " + error.message);
      }
    },

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
      try {
        if (!user) {
          throw new Error("Authentication required");
        }

        // Validate required fields
        if (!input.title) {
          throw new Error("Title is required");
        }
        if (!input.slug) {
          throw new Error("Slug is required");
        }
        if (!input.xmpUrl) {
          throw new Error("XMP URL is required");
        }

        // Check if preset with same slug already exists
        const existingPreset = await Preset.findOne({ slug: input.slug });
        if (existingPreset) {
          throw new Error("A preset with this slug already exists");
        }

        // Ensure settings object has the correct structure
        const settings = input.settings || {};
        const presetData = {
          ...input,
          creator: user.id,
          settings: {
            // Light settings
            exposure: parseFloat(settings.exposure) || 0,
            contrast: parseFloat(settings.contrast) || 0,
            highlights: parseFloat(settings.highlights) || 0,
            shadows: parseFloat(settings.shadows) || 0,
            whites: parseFloat(settings.whites) || 0,
            blacks: parseFloat(settings.blacks) || 0,

            // Color settings
            temp: parseFloat(settings.temp) || 0,
            tint: parseFloat(settings.tint) || 0,
            vibrance: parseFloat(settings.vibrance) || 0,
            saturation: parseFloat(settings.saturation) || 0,

            // Effects
            clarity: parseFloat(settings.clarity) || 0,
            dehaze: parseFloat(settings.dehaze) || 0,
            grain: settings.grain
              ? {
                  amount: parseFloat(settings.grain.amount) || 0,
                  size: parseFloat(settings.grain.size) || 0,
                  roughness: parseFloat(settings.grain.roughness) || 0,
                }
              : { amount: 0, size: 0, roughness: 0 },

            // Detail
            sharpening: parseFloat(settings.sharpening) || 0,
            noiseReduction: settings.noiseReduction
              ? {
                  luminance: parseFloat(settings.noiseReduction.luminance) || 0,
                  detail: parseFloat(settings.noiseReduction.detail) || 0,
                  color: parseFloat(settings.noiseReduction.color) || 0,
                }
              : { luminance: 0, detail: 0, color: 0 },
          },
          toneCurve: input.toneCurve
            ? {
                rgb: (input.toneCurve.rgb || []).map((v) => parseFloat(v) || 0),
                red: (input.toneCurve.red || []).map((v) => parseFloat(v) || 0),
                green: (input.toneCurve.green || []).map(
                  (v) => parseFloat(v) || 0
                ),
                blue: (input.toneCurve.blue || []).map(
                  (v) => parseFloat(v) || 0
                ),
              }
            : undefined,
        };

        const preset = await Preset.create(presetData);
        return preset;
      } catch (error) {
        console.error("Error creating preset:", error);
        throw error;
      }
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

    uploadPreset: async (
      _,
      { title, description, tags, settings, notes, beforeImage, afterImage },
      { user }
    ) => {
      if (!user) {
        throw new AuthenticationError(
          "You must be logged in to upload a preset"
        );
      }

      try {
        // Create or find tags
        const tagIds = await Promise.all(
          tags.map(async (tagName) => {
            const existingTag = await Tag.findOneAndUpdate(
              { name: tagName.toLowerCase() },
              {
                name: tagName.toLowerCase(),
                displayName: tagName,
                category: "preset",
              },
              { new: true, upsert: true }
            );
            return existingTag._id;
          })
        );

        // Generate slug from title
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        // Create sample images if provided
        let sampleImageIds = [];
        if (beforeImage || afterImage) {
          const images = [];
          if (beforeImage) {
            const beforeImageUrl = await handleFileUpload(
              beforeImage,
              "images"
            );
            const beforeImageDoc = await Image.create({
              url: beforeImageUrl,
              uploader: user.id,
              isBeforeImage: true,
              isAfterImage: false,
            });
            images.push(beforeImageDoc);
          }
          if (afterImage) {
            const afterImageUrl = await handleFileUpload(afterImage, "images");
            const afterImageDoc = await Image.create({
              url: afterImageUrl,
              uploader: user.id,
              isBeforeImage: false,
              isAfterImage: true,
            });
            images.push(afterImageDoc);
          }
          sampleImageIds = images.map((img) => img._id);
        }

        // Parse settings object
        const parsedSettings = {
          // Light settings
          exposure: parseFloat(settings.exposure) || 0,
          contrast: parseFloat(settings.contrast) || 0,
          highlights: parseFloat(settings.highlights) || 0,
          shadows: parseFloat(settings.shadows) || 0,
          whites: parseFloat(settings.whites) || 0,
          blacks: parseFloat(settings.blacks) || 0,

          // Color settings
          temp: parseFloat(settings.temp) || 0,
          tint: parseFloat(settings.tint) || 0,
          vibrance: parseFloat(settings.vibrance) || 0,
          saturation: parseFloat(settings.saturation) || 0,

          // Effects
          clarity: parseFloat(settings.clarity) || 0,
          dehaze: parseFloat(settings.dehaze) || 0,
          grain: settings.grain
            ? {
                amount: parseFloat(settings.grain.amount) || 0,
                size: parseFloat(settings.grain.size) || 0,
                roughness: parseFloat(settings.grain.roughness) || 0,
              }
            : { amount: 0, size: 0, roughness: 0 },

          // Detail
          sharpening: parseFloat(settings.sharpening) || 0,
          noiseReduction: settings.noiseReduction
            ? {
                luminance: parseFloat(settings.noiseReduction.luminance) || 0,
                detail: parseFloat(settings.noiseReduction.detail) || 0,
                color: parseFloat(settings.noiseReduction.color) || 0,
              }
            : { luminance: 0, detail: 0, color: 0 },
        };

        // Create the preset with the parsed settings
        const preset = await Preset.create({
          title,
          slug,
          description,
          settings: parsedSettings,
          notes,
          tags: tagIds,
          sampleImages: sampleImageIds,
          creator: user.id,
          isPublished: true,
        });

        return preset;
      } catch (error) {
        console.error("Error uploading preset:", error);
        throw new Error("Failed to upload preset: " + error.message);
      }
    },

    uploadFilmSim: async (
      _,
      { name, description, tags, settings, notes, sampleImages },
      { user }
    ) => {
      if (!user) {
        throw new AuthenticationError(
          "You must be logged in to upload a film simulation"
        );
      }

      try {
        console.log("Received settings:", JSON.stringify(settings, null, 2));

        // Create or find tags
        const tagIds = await Promise.all(
          tags.map(async (tagName) => {
            const existingTag = await Tag.findOneAndUpdate(
              { name: tagName.toLowerCase() },
              {
                name: tagName.toLowerCase(),
                displayName: tagName,
                category: "filmsim",
              },
              { new: true, upsert: true }
            );
            return existingTag._id;
          })
        );

        // Generate slug from name
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        // Convert dynamicRange number to string format if needed
        let dynamicRange = settings.dynamicRange;
        if (typeof dynamicRange === "number") {
          dynamicRange = `DR${dynamicRange}`;
        }

        // Create the film simulation
        const filmSimData = {
          name,
          slug,
          description,
          type: "custom-recipe",
          settings: {
            dynamicRange: parseInt(dynamicRange.replace("DR", "")) || 100,
            highlight: parseInt(settings.highlight) || 0,
            shadow: parseInt(settings.shadow) || 0,
            colour: parseInt(settings.color) || 0,
            sharpness: parseInt(settings.sharpness) || 0,
            noiseReduction: parseInt(settings.noiseReduction) || 0,
            grainEffect: parseInt(settings.grainEffect) || 0,
            clarity: parseInt(settings.clarity) || 0,
            whiteBalance: settings.whiteBalance || "auto",
            wbShift: {
              r: parseInt(settings.wbShift?.r) || 0,
              b: parseInt(settings.wbShift?.b) || 0,
            },
          },
          notes,
          tags: tagIds,
          creator: user.id,
        };

        console.log(
          "Creating film sim with data:",
          JSON.stringify(filmSimData, null, 2)
        );

        const filmSim = await FilmSim.create(filmSimData);
        return filmSim;
      } catch (error) {
        console.error("Error uploading film simulation:", error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
        throw new Error("Failed to upload film simulation: " + error.message);
      }
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
