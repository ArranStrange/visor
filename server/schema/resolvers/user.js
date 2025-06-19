const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../config/jwt");
const {
  AuthenticationError,
  ValidationError,
  UserInputError,
} = require("../../utils/errors");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const path = require("path");
const fs = require("fs");

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

// Helper function to handle file uploads
const handleFileUpload = async (file, directory) => {
  const { createReadStream, filename, mimetype } = await file;

  // Create directory if it doesn't exist
  const uploadDir = path.join(__dirname, "..", "..", "uploads", directory);
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

module.exports = {
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

    updateProfile: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        // Parse the JSON input if it's a string
        const updateData =
          typeof input === "string" ? JSON.parse(input) : input;

        // Prepare update object
        const updateFields = {};

        if (updateData.bio !== undefined) updateFields.bio = updateData.bio;
        if (updateData.instagram !== undefined)
          updateFields.instagram = updateData.instagram;
        if (updateData.cameras !== undefined)
          updateFields.cameras = updateData.cameras;
        if (updateData.avatar !== undefined)
          updateFields.avatar = updateData.avatar;

        // Find and update the user
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { $set: updateFields },
          { new: true, runValidators: true }
        );

        if (!updatedUser) {
          throw new Error("User not found");
        }

        // Return the updated user with proper ID format
        const userObj = updatedUser.toObject();
        return {
          ...userObj,
          id: userObj._id.toString(),
        };
      } catch (error) {
        console.error("Error updating profile:", error);
        throw new Error("Failed to update profile");
      }
    },

    uploadAvatar: async (_, { file }, { user }) => {
      if (!user) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        // Handle file upload
        const avatarPath = await handleFileUpload(file, "avatars");

        // Update user's avatar field
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { avatar: avatarPath },
          { new: true }
        );

        if (!updatedUser) {
          throw new Error("User not found");
        }

        // Return the avatar path
        return avatarPath;
      } catch (error) {
        console.error("Error uploading avatar:", error);
        throw new Error("Failed to upload avatar");
      }
    },
  },
};
