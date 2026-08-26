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
const { hashToken } = require("../../../utils/authTokens");
const {
  enforceRateLimit,
  REGISTER_LIMIT,
  PASSWORD_RESET_LIMIT,
  CHANGE_EMAIL_LIMIT,
  CHANGE_PASSWORD_LIMIT,
  DELETE_ACCOUNT_LIMIT,
} = require("../../../utils/mutationRateLimits");
const { tombstoneAccount } = require("./services/accountLifecycle");
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

      // A successful login means the account is not locked out, so any pending
      // reset link is both unnecessary and a loose end — retire it.
      if (user.resetTokenHash) {
        user.clearResetToken();
        await user.save();
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

  register: async (_, { username, email, password, honeypot }, { req }) => {
    try {
      // Rate limit first: a bot must not get unlimited free rejections just by
      // tripping the honeypot, and the email below is still unvalidated input.
      enforceRateLimit("register", req, REGISTER_LIMIT);

      // A hidden form field no human fills in. Bots that submit every input
      // give themselves away; real users never see it. Fail as a plain
      // validation error so a scripted client learns nothing about why.
      if (honeypot) {
        logger.warn("Rejected a registration with a filled honeypot");
        throw new ValidationError("Registration could not be completed");
      }

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
      const digest = hashToken(token);

      // The same link shape serves two jobs: verifying a new account's address,
      // and completing an email change staged by changeEmail. Try the pending
      // change first — it is the narrower match.
      const pendingChange = await User.findOne({
        pendingEmailTokenHash: digest,
        pendingEmailTokenExpiry: { $gt: new Date() },
      });

      if (pendingChange && !pendingChange.deletedAt) {
        // Guard against the address being claimed between staging and clicking.
        const taken = await User.findOne({
          email: pendingChange.pendingEmail,
          _id: { $ne: pendingChange._id },
        });

        if (taken) {
          pendingChange.clearPendingEmail();
          await pendingChange.save();

          return {
            success: false,
            message:
              "That email address has since been registered to another " +
              "account. Your address is unchanged.",
          };
        }

        pendingChange.email = pendingChange.pendingEmail;
        pendingChange.emailVerified = true;
        pendingChange.clearPendingEmail();
        // The email is a credential, so completing the change signs out
        // sessions that were established under the old address.
        pendingChange.credentialsChangedAt = new Date();
        await pendingChange.save();

        return {
          success: true,
          message:
            `Your email address is now ${pendingChange.email}. ` +
            "Please log in again.",
          user: {
            ...pendingChange.toObject(),
            id: pendingChange._id.toString(),
          },
        };
      }

      // Look the account up by the token's digest: the raw token from the email
      // is never stored, so it cannot be queried directly.
      const user = await User.findOne({
        verificationToken: digest,
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

  requestPasswordReset: async (_, { email }, { req }) => {
    // The same answer regardless of outcome: a different message for unknown
    // addresses would turn this into an account-existence oracle.
    const genericResponse = {
      success: true,
      message:
        "If that email address has an account, a reset link is on its way. " +
        "The link is valid for one hour.",
    };

    try {
      enforceRateLimit("password-reset", req, PASSWORD_RESET_LIMIT);

      const user = await User.findOne({ email });

      if (!user || user.deletedAt) {
        logger.info("Password reset requested for an address with no account");
        return genericResponse;
      }

      const resetToken = user.generateResetToken();
      await user.save();

      const emailResult = await EmailService.sendPasswordResetEmail(
        user.email,
        user.username,
        resetToken
      );

      if (!emailResult.success) {
        logger.warn(`Failed to send password reset email: ${emailResult.message}`);
      }

      return genericResponse;
    } catch (error) {
      // Rate limiting is the one case the caller must actually see.
      if (error instanceof UserInputError) throw error;
      logger.error("Password reset request error", error);
      return genericResponse;
    }
  },

  resetPassword: async (_, { token, email, newPassword }) => {
    try {
      const user = await User.findOne({
        email,
        resetTokenHash: hashToken(token),
        resetTokenExpiry: { $gt: new Date() },
      });

      if (!user || user.deletedAt) {
        return {
          success: false,
          message:
            "That reset link is invalid or has expired. Request a new one to try again.",
        };
      }

      validatePassword(newPassword);

      user.password = newPassword; // hashed by the pre-save hook
      user.clearResetToken();
      // Signs out every other session: whoever prompted the reset loses access.
      user.credentialsChangedAt = new Date();

      // A reset proves control of the address, so treat it as verification too.
      // Without this, a user who never clicked the original verification link
      // could reset their password and still be unable to log in.
      user.emailVerified = true;

      await user.save();

      return {
        success: true,
        message: "Password updated. You can now log in with your new password.",
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof UserInputError) {
        throw error;
      }
      logger.error("Password reset error", error);
      throw new ApolloError(
        "An error occurred while resetting your password",
        "INTERNAL_SERVER_ERROR"
      );
    }
  },

  changePassword: async (_, { currentPassword, newPassword }, context) => {
    try {
      requireAuth(context.user, "You must be logged in to change your password");
      enforceRateLimit(
        "change-password",
        context.req,
        CHANGE_PASSWORD_LIMIT,
        context.user.id
      );

      const user = await User.findById(context.user.id);
      if (!user || user.deletedAt) {
        throw new AuthenticationError("Account not found");
      }

      const correct = await user.comparePassword(currentPassword);
      if (!correct) {
        throw new ValidationError("Your current password is incorrect");
      }

      validatePassword(newPassword);

      user.password = newPassword;
      user.clearResetToken();
      user.credentialsChangedAt = new Date();
      await user.save();

      return {
        success: true,
        message:
          "Password updated. Other devices have been signed out — " +
          "you will need to log in again on them.",
      };
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof UserInputError ||
        error instanceof AuthenticationError
      ) {
        throw error;
      }
      logger.error("Change password error", error);
      throw new ApolloError(
        "An error occurred while changing your password",
        "INTERNAL_SERVER_ERROR"
      );
    }
  },

  changeEmail: async (_, { currentPassword, newEmail }, context) => {
    try {
      requireAuth(context.user, "You must be logged in to change your email");
      enforceRateLimit(
        "change-email",
        context.req,
        CHANGE_EMAIL_LIMIT,
        context.user.id
      );

      const user = await User.findById(context.user.id);
      if (!user || user.deletedAt) {
        throw new AuthenticationError("Account not found");
      }

      const correct = await user.comparePassword(currentPassword);
      if (!correct) {
        throw new ValidationError("Your current password is incorrect");
      }

      validateEmail(newEmail);

      if (newEmail === user.email) {
        throw new ValidationError("That is already your email address");
      }

      const taken = await User.findOne({ email: newEmail });
      if (taken) {
        // Any account can already discover this by trying to register, so this
        // reveals nothing new — and silence here would be worse for the user.
        throw new ValidationError("That email address is already in use");
      }

      // Stage the change rather than applying it. The live address stays put
      // until the new inbox is confirmed, so a typo costs a wasted email
      // instead of locking the account out of every recovery route.
      const pendingToken = user.generatePendingEmailToken(newEmail);
      await user.save();

      const emailResult = await EmailService.sendVerificationEmail(
        newEmail,
        user.username,
        pendingToken
      );

      if (!emailResult.success) {
        // Nothing has changed yet, so this is a plain failure the user can
        // retry — reporting success here would leave them waiting for an email
        // that is never coming.
        logger.warn(`Pending email verification send failed: ${emailResult.message}`);
        user.clearPendingEmail();
        await user.save();

        return {
          success: false,
          message:
            "We couldn't send the verification email just now. " +
            "Your address is unchanged — please try again shortly.",
        };
      }

      return {
        success: true,
        message:
          `Check ${newEmail} for a verification link. Your address stays as ` +
          `${user.email} until you click it.`,
      };
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof UserInputError ||
        error instanceof AuthenticationError
      ) {
        throw error;
      }
      logger.error("Change email error", error);
      throw new ApolloError(
        "An error occurred while changing your email",
        "INTERNAL_SERVER_ERROR"
      );
    }
  },

  deleteAccount: async (_, { currentPassword }, context) => {
    try {
      requireAuth(context.user, "You must be logged in to delete your account");
      enforceRateLimit(
        "delete-account",
        context.req,
        DELETE_ACCOUNT_LIMIT,
        context.user.id
      );

      const user = await User.findById(context.user.id);
      if (!user || user.deletedAt) {
        throw new AuthenticationError("Account not found");
      }

      const correct = await user.comparePassword(currentPassword);
      if (!correct) {
        throw new ValidationError("Your password is incorrect");
      }

      const removed = await tombstoneAccount(user);
      logger.info(
        `Account tombstoned: ${removed.loadoutsDeleted} loadouts and ` +
          `${removed.notificationsDeleted} notifications deleted`
      );

      return {
        success: true,
        message:
          "Your account has been deleted. Presets, film sims and posts you " +
          "shared remain on Visor, no longer linked to you.",
      };
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof UserInputError ||
        error instanceof AuthenticationError
      ) {
        throw error;
      }
      logger.error("Delete account error", error);
      throw new ApolloError(
        "An error occurred while deleting your account",
        "INTERNAL_SERVER_ERROR"
      );
    }
  },
};
