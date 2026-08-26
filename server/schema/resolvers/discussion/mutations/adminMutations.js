const Discussion = require("../../../../models/Discussion");
const { requireAdmin } = require("../../../../utils/authHelpers");

module.exports = {
  adminDeleteDiscussion: async (_, { id }, context) => {
    try {
      requireAdmin(context.user);

      const discussion = await Discussion.findById(id);
      if (!discussion) {
        throw new Error("Discussion not found");
      }

      await Discussion.findByIdAndDelete(id);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete discussion: ${error.message}`);
    }
  },

  adminDeletePost: async (_, { discussionId, postIndex }, context) => {
    try {
      requireAdmin(context.user);

      const discussion = await Discussion.findById(discussionId);
      if (!discussion) {
        throw new Error("Discussion not found");
      }

      if (postIndex < 0 || postIndex >= discussion.posts.length) {
        throw new Error("Invalid post index");
      }

      // Remove the post
      discussion.posts.splice(postIndex, 1);
      await discussion.save();

      return discussion;
    } catch (error) {
      throw new Error(`Failed to delete post: ${error.message}`);
    }
  },

  adminDeleteReply: async (
    _,
    { discussionId, postIndex, replyIndex },
    context
  ) => {
    try {
      requireAdmin(context.user);

      const discussion = await Discussion.findById(discussionId);
      if (!discussion) {
        throw new Error("Discussion not found");
      }

      if (postIndex < 0 || postIndex >= discussion.posts.length) {
        throw new Error("Invalid post index");
      }

      const post = discussion.posts[postIndex];
      if (
        !post.replies ||
        replyIndex < 0 ||
        replyIndex >= post.replies.length
      ) {
        throw new Error("Invalid reply index");
      }

      // Remove the reply
      post.replies.splice(replyIndex, 1);
      await discussion.save();

      return true;
    } catch (error) {
      throw new Error(`Failed to delete reply: ${error.message}`);
    }
  },

  adminUpdateDiscussion: async (_, { id, input }, context) => {
    try {
      requireAdmin(context.user);

      const discussion = await Discussion.findById(id);
      if (!discussion) {
        throw new Error("Discussion not found");
      }

      // Update the discussion
      Object.keys(input).forEach((key) => {
        if (input[key] !== undefined) {
          discussion[key] = input[key];
        }
      });

      await discussion.save();
      return discussion;
    } catch (error) {
      throw new Error(`Failed to update discussion: ${error.message}`);
    }
  },
};
