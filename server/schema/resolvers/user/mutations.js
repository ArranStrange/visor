const { ApolloError } = require("apollo-server-express");
const {
  AuthenticationError,
  ValidationError,
  UserInputError,
} = require("../../../utils/errors");
const User = require("../../../models/User");
const EmailService = require("../../../utils/emailService");
const { createLogger } = require("../../../utils/logger");
const { requireAuth } = require("../../../utils/authHelpers");
const { findCamera } = require("../../../constants/fujifilmCameras");
const {
  generateToken,
  validateEmail,
  validatePassword,
  validateUsername,
  handleFileUpload,
} = require("./services/userAuth");

const logger = createLogger("resolvers:user");

/**
 * Resolve a user-supplied camera name to its canonical catalogue spelling.
 * The whole point of a primary camera is that the rest of the app can look
 * it up, so a free-text value that matches nothing is rejected rather than
 * stored. Empty string / null clears the setting.
 */
const normalizePrimaryCamera = (value) => {
  if (value === null || value === "") return null;
  if (typeof value !== "string") {
    throw new UserInputError("primaryCamera must be a camera name");
  }
  const camera = findCamera(value);
  if (!camera) {
    throw new UserInputError(`"${value}" is not a known Fujifilm camera`);
  }
  return camera.name;
};

module.exports = {
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
      logger.error("Login error", error);
      throw new ApolloError(
        "An error occurred during login",
        "INTERNAL_SERVER_ERROR"
      );
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
        logger.warn(`Failed to send verification email: ${emailResult.message}`);
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
      logger.error("Registration error", error);
      throw new ApolloError(
        "An error occurred during registration",
        "INTERNAL_SERVER_ERROR"
      );
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
        (error) => logger.error("Failed to send welcome email", error)
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
      logger.error("Email verification error", error);
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
      logger.error("Resend verification email error", error);
      return {
        success: false,
        message: "An error occurred while sending verification email",
      };
    }
  },

  updateProfile: async (_, { input }, { user }) => {
    requireAuth(user, "Not authenticated");

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
      if (updateData.primaryCamera !== undefined) {
        updateFields.primaryCamera = normalizePrimaryCamera(
          updateData.primaryCamera
        );
      }

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        throw new AuthenticationError("User not found");
      }

      const userObj = updatedUser.toObject();
      return {
        ...userObj,
        id: userObj._id.toString(),
      };
    } catch (error) {
      logger.error("Error updating profile", error);
      if (
        error instanceof AuthenticationError ||
        error instanceof UserInputError
      ) {
        // Keep validation messages (e.g. an unknown camera) intact instead of
        // flattening them into a generic failure the UI can't explain.
        throw error;
      }
      throw new ApolloError(
        "Failed to update profile",
        "INTERNAL_SERVER_ERROR"
      );
    }
  },

  uploadAvatar: async (_, { file }, { user }) => {
    requireAuth(user, "Not authenticated");

    try {
      const avatarPath = await handleFileUpload(file, "avatars");

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { avatar: avatarPath },
        { new: true }
      );

      if (!updatedUser) {
        throw new AuthenticationError("User not found");
      }

      return avatarPath;
    } catch (error) {
      logger.error("Error uploading avatar", error);
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApolloError(
        "Failed to upload avatar",
        "INTERNAL_SERVER_ERROR"
      );
    }
  },
};
