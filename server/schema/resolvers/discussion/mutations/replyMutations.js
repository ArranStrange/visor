const Discussion = require("../../../../models/Discussion");
const User = require("../../../../models/User");
const { createLogger } = require("../../../../utils/logger");
const {
  requireAuth,
  requireOwnership,
} = require("../../../../utils/authHelpers");

const logger = createLogger("resolvers:discussion");

module.exports = {
  createReply: async (_, { input }, { user }) => {
    try {
      requireAuth(user, "Not authenticated");

      const { discussionId, postIndex, content } = input;

      const discussion = await Discussion.findById(discussionId);
      if (!discussion || !discussion.isActive) {
        throw new Error("Discussion not found or inactive");
      }

      if (postIndex < 0 || postIndex >= discussion.posts.length) {
        throw new Error("Post not found");
      }

      const userInfo = await User.findById(user.id).select("username avatar");

      const newReply = {
        userId: user.id,
        username: userInfo.username,
        avatar: userInfo.avatar,
        content: content.trim(),
        timestamp: new Date(),
        isEdited: false,
      };

      if (!discussion.posts[postIndex].replies) {
        discussion.posts[postIndex].replies = [];
      }
      discussion.posts[postIndex].replies.push(newReply);
      await discussion.save();

      return newReply;
    } catch (error) {
      logger.error("Error in createReply", error);
      throw new Error(`Failed to create reply: ${error.message}`);
    }
  },

  updateReply: async (_, { input }, { user }) => {
    try {
      requireAuth(user, "Not authenticated");

      const { discussionId, postIndex, replyIndex, content } = input;

      const discussion = await Discussion.findById(discussionId);
      if (!discussion || !discussion.isActive) {
        throw new Error("Discussion not found or inactive");
      }

      if (postIndex < 0 || postIndex >= discussion.posts.length) {
        throw new Error("Post not found");
      }

      const post = discussion.posts[postIndex];
      if (
        !post.replies ||
        replyIndex < 0 ||
        replyIndex >= post.replies.length
      ) {
        throw new Error("Reply not found");
      }

      const reply = post.replies[replyIndex];
      requireOwnership(user, reply, "userId", { allowAdmin: false });

      reply.content = content.trim();
      reply.isEdited = true;
      reply.editedAt = new Date();

      await discussion.save();

      return reply;
    } catch (error) {
      logger.error("Error in updateReply", error);
      throw new Error(`Failed to update reply: ${error.message}`);
    }
  },

  deleteReply: async (
    _,
    { discussionId, postIndex, replyIndex },
    { user }
  ) => {
    try {
      requireAuth(user, "Not authenticated");

      const discussion = await Discussion.findById(discussionId);
      if (!discussion || !discussion.isActive) {
        throw new Error("Discussion not found or inactive");
      }

      if (postIndex < 0 || postIndex >= discussion.posts.length) {
        throw new Error("Post not found");
      }

      const post = discussion.posts[postIndex];
      if (
        !post.replies ||
        replyIndex < 0 ||
        replyIndex >= post.replies.length
      ) {
        throw new Error("Reply not found");
      }

      const reply = post.replies[replyIndex];
      requireOwnership(user, reply, "userId", { allowAdmin: false });

      post.replies.splice(replyIndex, 1);
      await discussion.save();

      return true;
    } catch (error) {
      logger.error("Error in deleteReply", error);
      throw new Error(`Failed to delete reply: ${error.message}`);
    }
  },
};
