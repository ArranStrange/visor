const { GraphQLUpload } = require("graphql-upload");
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
const cloudinary = require("cloudinary");

const User = require("../models/User");
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
    getCurrentUser: async (_, __, { user }) => {
      if (!user) {
        throw new Error("Not authenticated");
      }

      try {
        const foundUser = await User.findById(user._id).populate({
          path: "customLists",
          populate: [
            { path: "presets", select: "id title slug thumbnail" },
            { path: "filmSims", select: "id name slug thumbnail" },
          ],
        });

        if (!foundUser) {
          throw new Error("User not found");
        }

        // Convert user to plain object and ensure all IDs are strings
        const userObj = foundUser.toObject();

        return {
          ...userObj,
          id: userObj._id.toString(),
          customLists:
            userObj.customLists?.map((list) => ({
              ...list,
              id: list._id.toString(),
              presets:
                list.presets?.map((preset) => ({
                  ...preset,
                  id: preset._id.toString(),
                })) || [],
              filmSims:
                list.filmSims?.map((filmSim) => ({
                  ...filmSim,
                  id: filmSim._id.toString(),
                })) || [],
            })) || [],
        };
      } catch (error) {
        console.error("Error in getCurrentUser:", error);
        throw new Error("Error fetching user profile");
      }
    },
    searchUsers: async (_, { query }) =>
      await User.find({ username: new RegExp(query, "i") }),
    getFilmSim: async (_, { slug }) => await FilmSim.findOne({ slug }),
    listFilmSims: async (_, { filter }) =>
      await FilmSim.find(filter || {}).populate("creator"),
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
        console.log("Starting film simulation upload process...");
        console.log(
          "Received sample images:",
          JSON.stringify(sampleImages, null, 2)
        );

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
        console.log("Processed tags:", tagIds);

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

        // Create the film simulation first
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
            wbShift: settings.wbShift || { r: 0, b: 0 },
          },
          notes,
          tags: tagIds,
          creator: user.id,
        };

        console.log(
          "Creating film simulation with data:",
          JSON.stringify(filmSimData, null, 2)
        );
        const filmSim = await FilmSim.create(filmSimData);
        console.log("Successfully created film simulation:", filmSim._id);

        // Create sample images if provided
        let sampleImageIds = [];
        if (sampleImages && sampleImages.length > 0) {
          console.log("Processing sample images...");
          const images = await Promise.all(
            sampleImages.map(async (image) => {
              console.log("Creating image document for:", image.url);
              const imageDoc = await Image.create({
                url: image.url,
                publicId: image.publicId,
                uploader: user.id,
                associatedWith: {
                  kind: "FilmSim",
                  item: filmSim._id,
                },
              });
              console.log("Created image document:", imageDoc._id);
              return imageDoc._id;
            })
          );
          sampleImageIds = images.map((img) => img._id);
          console.log("Created sample image IDs:", sampleImageIds);

          // Update the film simulation with the sample image IDs
          filmSim.sampleImages = sampleImageIds;
          await filmSim.save();
        }

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
