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
const Preset = require("../../models/Preset");
const FilmSim = require("../../models/FilmSim");
const EmailService = require("../../utils/emailService");
const ReCAPTCHAService = require("../../utils/recaptchaService");

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

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format");
  }
};

const validatePassword = (password) => {
  if (password.length < 6) {
    throw new ValidationError("Password must be at least 6 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    throw new ValidationError(
      "Password must contain at least one uppercase letter"
    );
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

const handleFileUpload = async (file, directory) => {
  const { createReadStream, filename, mimetype } = await file;

  const uploadDir = path.join(__dirname, "..", "..", "uploads", directory);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const uniqueFilename = `${Date.now()}-${filename}`;
  const filepath = path.join(uploadDir, uniqueFilename);

  const writeStream = fs.createWriteStream(filepath);

  await new Promise((resolve, reject) => {
    createReadStream()
      .pipe(writeStream)
      .on("finish", resolve)
      .on("error", reject);
  });

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
        const currentUser = await User.findById(user.id || user._id);
        if (!currentUser) {
          throw new AuthenticationError("User not found");
        }

        const userObj = currentUser.toObject();
        return {
          ...userObj,
          id: userObj._id.toString(),
        };
      } catch (error) {
        console.error("Error getting current user:", error);
        throw new AuthenticationError("Failed to get current user");
      }
    },

    searchUsers: async (_, { query }) => {
      try {
        const users = await User.find({
          $or: [
            { username: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        }).limit(10);

        return users.map((user) => ({
          ...user.toObject(),
          id: user._id.toString(),
        }));
      } catch (error) {
        console.error("Error searching users:", error);
        throw new Error("Failed to search users");
      }
    },
  },

  Mutation: {
    login: async (_, { email, password }) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          throw new AuthenticationError("Invalid email or password");
        }

        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
          throw new AuthenticationError("Invalid email or password");
        }

        if (!user.emailVerified) {
          throw new AuthenticationError(
            "Please verify your email address before logging in"
          );
        }

        return {
          token: generateToken(user),
          user: {
            ...user.toObject(),
            id: user._id.toString(),
          },
        };
      } catch (error) {
        if (error instanceof AuthenticationError) {
          throw error;
        }
        throw new Error("An error occurred during login");
      }
    },

    register: async (_, { username, email, password }, { req }) => {
      try {
        // reCAPTCHA temporarily disabled
        /*
        // Validate reCAPTCHA token
        const recaptchaResult = await ReCAPTCHAService.verifyToken(
          recaptchaToken,
          req?.ip || null
        );

        if (!recaptchaResult.success) {
          throw new ValidationError(recaptchaResult.message);
        }
        */

        // Validate input
        validateEmail(email);
        validatePassword(password);
        validateUsername(username);

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

        const user = new User({
          username,
          email,
          password,
          emailVerified: false,
        });

        const verificationToken = user.generateVerificationToken();
        await user.save();

        const emailResult = await EmailService.sendVerificationEmail(
          email,
          username,
          verificationToken
        );

        if (!emailResult.success) {
          console.error(
            "Failed to send verification email:",
            emailResult.message
          );
        }

        return {
          success: true,
          message: emailResult.success
            ? "Registration successful! Please check your email to verify your account."
            : "Registration successful! Please check your email to verify your account. (Email delivery may be delayed)",
          requiresVerification: true,
          user: {
            ...user.toObject(),
            id: user._id.toString(),
          },
        };
      } catch (error) {
        if (
          error instanceof ValidationError ||
          error instanceof UserInputError
        ) {
          throw error;
        }
        console.error("Registration error:", error);
        console.error("Error stack:", error.stack);
        throw new Error("An error occurred during registration");
      }
    },

    verifyEmail: async (_, { token }) => {
      try {
        const user = await User.findOne({
          verificationToken: token,
          tokenExpiry: { $gt: new Date() },
        });

        if (!user) {
          return {
            success: false,
            message: "Invalid or expired verification token",
            user: null,
          };
        }

        user.emailVerified = true;
        user.verificationToken = undefined;
        user.tokenExpiry = undefined;
        await user.save();

        EmailService.sendWelcomeEmail(user.email, user.username).catch(
          (error) => console.error("Failed to send welcome email:", error)
        );

        return {
          success: true,
          message:
            "Email verified successfully! You can now log in to your account.",
          user: {
            ...user.toObject(),
            id: user._id.toString(),
          },
        };
      } catch (error) {
        console.error("Email verification error:", error);
        return {
          success: false,
          message: "An error occurred during email verification",
          user: null,
        };
      }
    },

    resendVerificationEmail: async (_, { email }) => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          return {
            success: false,
            message: "No account found with this email address",
          };
        }

        if (user.emailVerified) {
          return {
            success: false,
            message: "Email is already verified",
          };
        }

        const verificationToken = user.generateVerificationToken();
        await user.save();

        const emailResult = await EmailService.sendVerificationEmail(
          email,
          user.username,
          verificationToken
        );

        return {
          success: emailResult.success,
          message: emailResult.success
            ? "Verification email sent successfully!"
            : "Failed to send verification email. Please try again later.",
        };
      } catch (error) {
        console.error("Resend verification email error:", error);
        return {
          success: false,
          message: "An error occurred while sending verification email",
        };
      }
    },

    updateProfile: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const updateData =
          typeof input === "string" ? JSON.parse(input) : input;

        const updateFields = {};

        if (updateData.bio !== undefined) updateFields.bio = updateData.bio;
        if (updateData.instagram !== undefined)
          updateFields.instagram = updateData.instagram;
        if (updateData.cameras !== undefined)
          updateFields.cameras = updateData.cameras;
        if (updateData.avatar !== undefined)
          updateFields.avatar = updateData.avatar;

        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { $set: updateFields },
          { new: true, runValidators: true }
        );

        if (!updatedUser) {
          throw new Error("User not found");
        }

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
        const avatarPath = await handleFileUpload(file, "avatars");

        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { avatar: avatarPath },
          { new: true }
        );

        if (!updatedUser) {
          throw new Error("User not found");
        }

        return avatarPath;
      } catch (error) {
        console.error("Error uploading avatar:", error);
        throw new Error("Failed to upload avatar");
      }
    },
  },

  User: {
    presets: async (parent) => {
      const user = await User.findById(parent.id || parent._id).populate({
        path: "uploadedPresets",
        populate: [
          { path: "tags" },
          { path: "creator" },
          { path: "likes" },
          { path: "beforeImage" },
          { path: "afterImage" },
          { path: "sampleImages" },
        ],
      });
      if (!user || !user.uploadedPresets) return [];
      return user.uploadedPresets.map((p) => ({
        ...p.toObject(),
        id: p._id.toString(),
        creator: p.creator
          ? { ...p.creator.toObject(), id: p.creator._id.toString() }
          : null,
        tags:
          p.tags?.map((t) => ({ ...t.toObject(), id: t._id.toString() })) || [],
        likes:
          p.likes?.map((l) => ({ ...l.toObject(), id: l._id.toString() })) ||
          [],
        beforeImage: p.beforeImage
          ? { ...p.beforeImage.toObject(), id: p.beforeImage._id.toString() }
          : null,
        afterImage: p.afterImage
          ? { ...p.afterImage.toObject(), id: p.afterImage._id.toString() }
          : null,
        sampleImages:
          p.sampleImages?.map((i) => ({
            ...i.toObject(),
            id: i._id.toString(),
          })) || [],
      }));
    },
    filmSims: async (parent) => {
      const user = await User.findById(parent.id || parent._id).populate({
        path: "uploadedFilmSims",
        populate: [
          { path: "tags" },
          { path: "creator" },
          { path: "sampleImages" },
        ],
      });
      if (!user || !user.uploadedFilmSims) return [];

      return user.uploadedFilmSims.map((f) => ({
        ...f.toObject(),
        id: f._id.toString(),
        creator: f.creator
          ? { ...f.creator.toObject(), id: f.creator._id.toString() }
          : null,
        tags:
          f.tags?.map((t) => ({ ...t.toObject(), id: t._id.toString() })) || [],
        likes: [],
        sampleImages:
          f.sampleImages?.map((i) => ({
            ...i.toObject(),
            id: i._id.toString(),
          })) || [],
      }));
    },
  },
};
