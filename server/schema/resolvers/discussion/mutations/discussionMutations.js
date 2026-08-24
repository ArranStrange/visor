const Discussion = require("../../../../models/Discussion");
const Preset = require("../../../../models/Preset");
const FilmSim = require("../../../../models/FilmSim");
const { createLogger } = require("../../../../utils/logger");
const {
  requireAuth,
  requireOwnership,
} = require("../../../../utils/authHelpers");

const logger = createLogger("resolvers:discussion");

module.exports = {
  createDiscussion: async (_, { input }, { user }) => {
    try {
      requireAuth(user, "Not authenticated");

      const { title, linkedToType, linkedToId } = input;

      // Verify the linked item exists
      const linkedItem =
        linkedToType === "PRESET"
          ? await Preset.findById(linkedToId)
          : await FilmSim.findById(linkedToId);

      if (!linkedItem) {
        throw new Error(
          `Linked ${linkedToType.toLowerCase()} not found with ID: ${linkedToId}`
        );
      }

      const discussion = new Discussion({
        title,
        linkedTo: {
          type: linkedToType.toLowerCase(),
          refId: linkedToId,
        },
        createdBy: user.id,
        followers: [user.id],
        posts: [],
      });

      await discussion.save();

      return await Discussion.findById(discussion._id)
        .populate("createdBy", "id username avatar")
        .populate("followers", "id username avatar");
    } catch (error) {
      logger.error("Error in createDiscussion", error);
      if (error.name === "ValidationError") {
        throw new Error(`Validation error: ${error.message}`);
      }
      if (error.name === "AuthenticationError") {
        throw error;
      }
      throw new Error(`Failed to create discussion: ${error.message}`);
    }
  },

  updateDiscussion: async (_, { id, input }, { user }) => {
    try {
      requireAuth(user, "Not authenticated");

      const discussion = await Discussion.findById(id);
      if (!discussion) {
        throw new Error("Discussion not found");
      }

      requireOwnership(user, discussion, "createdBy", { allowAdmin: false });

      const updatedDiscussion = await Discussion.findByIdAndUpdate(
        id,
        input,
        { new: true }
      )
        .populate("createdBy", "id username avatar")
        .populate("followers", "id username avatar");

      return updatedDiscussion;
    } catch (error) {
      throw new Error("Failed to update discussion");
    }
  },

  deleteDiscussion: async (_, { id }, { user }) => {
    try {
      requireAuth(user, "Not authenticated");

      const discussion = await Discussion.findById(id);
      if (!discussion) {
        throw new Error("Discussion not found");
      }

      requireOwnership(user, discussion, "createdBy", { allowAdmin: false });

      await Discussion.findByIdAndUpdate(id, { isActive: false });
      return true;
    } catch (error) {
      throw new Error("Failed to delete discussion");
    }
  },

  followDiscussion: async (_, { discussionId }, { user }) => {
    try {
      requireAuth(user, "Not authenticated");

      const discussion = await Discussion.findByIdAndUpdate(
        discussionId,
        { $addToSet: { followers: user.id } },
        { new: true }
      )
        .populate("createdBy", "id username avatar")
        .populate("followers", "id username avatar");

      if (!discussion) {
        throw new Error("Discussion not found");
      }

      return discussion;
    } catch (error) {
      throw new Error("Failed to follow discussion");
    }
  },

  unfollowDiscussion: async (_, { discussionId }, { user }) => {
    try {
      requireAuth(user, "Not authenticated");

      const discussion = await Discussion.findByIdAndUpdate(
        discussionId,
        { $pull: { followers: user.id } },
        { new: true }
      )
        .populate("createdBy", "id username avatar")
        .populate("followers", "id username avatar");

      if (!discussion) {
        throw new Error("Discussion not found");
      }

      return discussion;
    } catch (error) {
      throw new Error("Failed to unfollow discussion");
    }
  },
};
