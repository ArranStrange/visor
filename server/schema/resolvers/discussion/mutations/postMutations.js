const Discussion = require("../../../../models/Discussion");
const User = require("../../../../models/User");
const { createLogger } = require("../../../../utils/logger");
const {
  requireAuth,
  requireOwnership,
} = require("../../../../utils/authHelpers");

const logger = createLogger("resolvers:discussion");

module.exports = {
  createPost: async (_, { input }, { user }) => {
    try {
      requireAuth(user, "Not authenticated");

      const { discussionId, content } = input;

      // Find the discussion
      const discussion = await Discussion.findById(discussionId);
      if (!discussion || !discussion.isActive) {
        throw new Error("Discussion not found or inactive");
      }

      // Get user info for the post
      const userInfo = await User.findById(user.id).select("username avatar");

      // Create the new post object
      const newPost = {
        userId: user.id,
        username: userInfo.username,
        avatar: userInfo.avatar,
        content: content.trim(),
        timestamp: new Date(),
        isEdited: false,
      };

      // Add the post to the discussion's posts array
      discussion.posts.push(newPost);
      await discussion.save();

      // Return the created post (it's now part of the discussion)
      return newPost;
    } catch (error) {
      logger.error("Error in createPost", error);

      if (error.name === "AuthenticationError") {
        throw error;
      }

      if (error.name === "ValidationError") {
        throw new Error(`Validation error: ${error.message}`);
      }

      if (error.name === "CastError") {
        throw new Error(`Invalid ID format: ${error.message}`);
      }

      if (error.message.includes("Discussion not found")) {
        throw error;
      }

      logger.error("Database error in createPost", error);
      throw new Error(`Database error: ${error.message}`);
    }
  },

  updatePost: async (_, { input }, { user }) => {
    try {
      requireAuth(user, "Not authenticated");

      const { discussionId, postIndex, content } = input;

      // Find the discussion
      const discussion = await Discussion.findById(discussionId);
      if (!discussion || !discussion.isActive) {
        throw new Error("Discussion not found or inactive");
      }

      // Check if post index is valid
      if (postIndex < 0 || postIndex >= discussion.posts.length) {
        throw new Error("Post not found");
      }

      const post = discussion.posts[postIndex];

      // Check if user is the author
      requireOwnership(user, post, "userId", { allowAdmin: false });

      // Update the post
      discussion.posts[postIndex] = {
        ...post,
        content: content.trim(),
        isEdited: true,
        editedAt: new Date(),
      };

      await discussion.save();

      // Return the updated post
      return discussion.posts[postIndex];
    } catch (error) {
      logger.error("Error in updatePost", error);

      if (error.name === "AuthenticationError") {
        throw error;
      }

      if (error.message === "Post not found") {
        throw new Error("Post not found");
      }

      if (error.name === "CastError") {
        throw new Error(`Invalid ID format: ${error.message}`);
      }

      if (error.name === "ValidationError") {
        throw new Error(`Validation error: ${error.message}`);
      }

      logger.error("Database error in updatePost", error);
      throw new Error(`Database error: ${error.message}`);
    }
  },

  deletePost: async (_, { discussionId, postIndex }, { user }) => {
    try {
      requireAuth(user, "Not authenticated");

      // Find the discussion
      const discussion = await Discussion.findById(discussionId);
      if (!discussion || !discussion.isActive) {
        throw new Error("Discussion not found or inactive");
      }

      // Check if post index is valid
      if (postIndex < 0 || postIndex >= discussion.posts.length) {
        throw new Error("Post not found");
      }

      const post = discussion.posts[postIndex];

      // Check if user is the author
      requireOwnership(user, post, "userId", { allowAdmin: false });

      // Remove the post from the array
      discussion.posts.splice(postIndex, 1);
      await discussion.save();

      return true;
    } catch (error) {
      logger.error("Error in deletePost", error);

      if (error.name === "AuthenticationError") {
        throw error;
      }

      if (error.message === "Post not found") {
        throw new Error("Post not found");
      }

      if (error.name === "CastError") {
        throw new Error(`Invalid ID format: ${error.message}`);
      }

      if (error.name === "ValidationError") {
        throw new Error(`Validation error: ${error.message}`);
      }

      logger.error("Database error in deletePost", error);
      throw new Error(`Database error: ${error.message}`);
    }
  },
};
