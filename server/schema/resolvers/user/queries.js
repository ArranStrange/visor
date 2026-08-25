const { ApolloError } = require("apollo-server-express");
const { AuthenticationError, UserInputError } = require("../../../utils/errors");
const User = require("../../../models/User");
const { createLogger } = require("../../../utils/logger");
const { requireAuth } = require("../../../utils/authHelpers");

const logger = createLogger("resolvers:user");

module.exports = {
  getUser: async (_, { id }) => {
    if (!id) {
      throw new UserInputError("id is required");
    }
    return await User.findById(id);
  },

  getCurrentUser: async (_, __, { user }) => {
    requireAuth(user, "Not authenticated");

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
      logger.error("Error getting current user", error);
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new ApolloError(
        "Failed to get current user",
        "INTERNAL_SERVER_ERROR"
      );
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
      logger.error("Error searching users", error);
      throw new ApolloError("Failed to search users", "INTERNAL_SERVER_ERROR");
    }
  },
};
