const Discussion = require("../../models/Discussion");
const User = require("../../models/User");
const Preset = require("../../models/Preset");
const FilmSim = require("../../models/FilmSim");
const { createPostNotifications } = require("../../utils/notificationUtils");
const { serializeDocument } = require("../../utils/serializationUtils");
const {
  AuthenticationError,
  UserInputError,
} = require("apollo-server-express");

const discussionResolvers = {
  Query: {
    getDiscussions: async (
      _,
      { page = 1, limit = 20, type, search, createdBy }
    ) => {
      try {
        const skip = (page - 1) * limit;
        const query = { isActive: true };

        if (type) {
          query["linkedTo.type"] = type.toLowerCase();
        }

        if (search) {
          const searchRegex = new RegExp(search, "i");

          const discussionsWithMatches = await Discussion.find({
            ...query,
            $or: [{ title: searchRegex }, { "posts.content": searchRegex }],
          }).select("_id");

          const discussionIds = discussionsWithMatches.map((d) =>
            d._id.toString()
          );

          if (discussionIds.length > 0) {
            query._id = { $in: discussionIds };
          } else {
            return {
              discussions: [],
              totalCount: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            };
          }
        }

        if (createdBy) {
          query.createdBy = createdBy;
        }

        const [discussions, totalCount] = await Promise.all([
          Discussion.find(query)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("createdBy", "id username avatar")
            .populate("followers", "id username avatar"),
          Discussion.countDocuments(query),
        ]);

        return {
          discussions,
          totalCount,
          hasNextPage: skip + limit < totalCount,
          hasPreviousPage: page > 1,
        };
      } catch (error) {
        console.error("Error in getDiscussions:", error);
        throw new Error("Failed to fetch discussions");
      }
    },

    getDiscussion: async (_, { id }) => {
      try {
        return await Discussion.findById(id)
          .populate("createdBy", "id username avatar")
          .populate("followers", "id username avatar");
      } catch (error) {
        throw new Error("Failed to fetch discussion");
      }
    },

    getDiscussionByLinkedItem: async (_, { type, refId }) => {
      try {
        return await Discussion.findOne({
          "linkedTo.type": type.toLowerCase(),
          "linkedTo.refId": refId,
          isActive: true,
        })
          .populate("createdBy", "id username avatar")
          .populate("followers", "id username avatar");
      } catch (error) {
        throw new Error("Failed to fetch discussion");
      }
    },

    // Old post queries removed - posts are now embedded in discussions

    // Search
    searchDiscussions: async (_, { query, page = 1, limit = 20 }) => {
      try {
        const skip = (page - 1) * limit;
        const searchRegex = new RegExp(query, "i");

        // Search in discussion titles and embedded posts
        const searchQuery = {
          isActive: true,
          $or: [{ title: searchRegex }, { "posts.content": searchRegex }],
        };

        const [discussions, totalCount] = await Promise.all([
          Discussion.find(searchQuery)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("createdBy", "id username avatar")
            .populate("followers", "id username avatar"),
          Discussion.countDocuments(searchQuery),
        ]);

        return {
          discussions,
          totalCount,
          hasNextPage: skip + limit < totalCount,
          hasPreviousPage: page > 1,
        };
      } catch (error) {
        console.error("Error in searchDiscussions:", error);
        throw new Error("Failed to search discussions");
      }
    },

    // User activity
    getFollowedDiscussions: async (_, { userId, page = 1, limit = 20 }) => {
      try {
        const skip = (page - 1) * limit;
        const [discussions, totalCount] = await Promise.all([
          Discussion.find({ followers: userId, isActive: true })
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("createdBy", "id username avatar")
            .populate("followers", "id username avatar"),
          Discussion.countDocuments({ followers: userId, isActive: true }),
        ]);

        return {
          discussions,
          totalCount,
          hasNextPage: skip + limit < totalCount,
          hasPreviousPage: page > 1,
        };
      } catch (error) {
        throw new Error("Failed to fetch followed discussions");
      }
    },

    getRecentDiscussions: async (_, { limit = 10 }) => {
      try {
        return await Discussion.find({ isActive: true })
          .sort({ updatedAt: -1 })
          .limit(limit)
          .populate("createdBy", "id username avatar")
          .populate("followers", "id username avatar");
      } catch (error) {
        throw new Error("Failed to fetch recent discussions");
      }
    },
  },

  Mutation: {
    // Discussion mutations
    createDiscussion: async (_, { input }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError("Not authenticated");
        }

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
        console.error("Error in createDiscussion:", error);
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
        if (!user) {
          throw new AuthenticationError("Not authenticated");
        }

        const discussion = await Discussion.findById(id);
        if (!discussion) {
          throw new Error("Discussion not found");
        }

        if (discussion.createdBy.toString() !== user.id) {
          throw new AuthenticationError("Not authorized");
        }

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
        if (!user) {
          throw new AuthenticationError("Not authenticated");
        }

        const discussion = await Discussion.findById(id);
        if (!discussion) {
          throw new Error("Discussion not found");
        }

        if (discussion.createdBy.toString() !== user.id) {
          throw new AuthenticationError("Not authorized");
        }

        await Discussion.findByIdAndUpdate(id, { isActive: false });
        return true;
      } catch (error) {
        throw new Error("Failed to delete discussion");
      }
    },

    followDiscussion: async (_, { discussionId }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError("Not authenticated");
        }

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
        if (!user) {
          throw new AuthenticationError("Not authenticated");
        }

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

    // Post mutations
    createPost: async (_, { input }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError("Not authenticated");
        }

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
        console.error("Error in createPost:", error);

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

        console.error("Database error in createPost:", error);
        throw new Error(`Database error: ${error.message}`);
      }
    },

    updatePost: async (_, { input }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError("Not authenticated");
        }

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
        if (post.userId.toString() !== user.id.toString()) {
          throw new AuthenticationError("Not authorized");
        }

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
        console.error("Error in updatePost:", error);

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

        console.error("Database error in updatePost:", error);
        throw new Error(`Database error: ${error.message}`);
      }
    },

    deletePost: async (_, { discussionId, postIndex }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError("Not authenticated");
        }

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
        if (post.userId.toString() !== user.id.toString()) {
          throw new AuthenticationError("Not authorized");
        }

        // Remove the post from the array
        discussion.posts.splice(postIndex, 1);
        await discussion.save();

        return true;
      } catch (error) {
        console.error("Error in deletePost:", error);

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

        console.error("Database error in deletePost:", error);
        throw new Error(`Database error: ${error.message}`);
      }
    },

    // Reply mutations
    createReply: async (_, { input }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError("Not authenticated");
        }

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
        console.error("Error in createReply:", error);
        throw new Error(`Failed to create reply: ${error.message}`);
      }
    },

    updateReply: async (_, { input }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError("Not authenticated");
        }

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
        if (reply.userId.toString() !== user.id.toString()) {
          throw new AuthenticationError("Not authorized");
        }

        reply.content = content.trim();
        reply.isEdited = true;
        reply.editedAt = new Date();

        await discussion.save();

        return reply;
      } catch (error) {
        console.error("Error in updateReply:", error);
        throw new Error(`Failed to update reply: ${error.message}`);
      }
    },

    deleteReply: async (
      _,
      { discussionId, postIndex, replyIndex },
      { user }
    ) => {
      try {
        if (!user) {
          throw new AuthenticationError("Not authenticated");
        }

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
        if (reply.userId.toString() !== user.id.toString()) {
          throw new AuthenticationError("Not authorized");
        }

        post.replies.splice(replyIndex, 1);
        await discussion.save();

        return true;
      } catch (error) {
        console.error("Error in deleteReply:", error);
        throw new Error(`Failed to delete reply: ${error.message}`);
      }
    },

    // Admin-only mutations
    adminDeleteDiscussion: async (_, { id }, context) => {
      try {
        console.log("Admin delete discussion - ID received:", id);
        const user = context.user;
        if (!user || !user.isAdmin) {
          throw new Error("Admin access required");
        }

        const discussion = await Discussion.findById(id);
        console.log("Discussion found:", discussion ? "Yes" : "No");
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
        const user = context.user;
        if (!user || !user.isAdmin) {
          throw new Error("Admin access required");
        }

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
        const user = context.user;
        if (!user || !user.isAdmin) {
          throw new Error("Admin access required");
        }

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
        const user = context.user;
        if (!user || !user.isAdmin) {
          throw new Error("Admin access required");
        }

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
  },

  Discussion: {
    linkedTo: async (discussion) => {
      let linkedItem = null;

      if (discussion.linkedTo.type === "preset") {
        linkedItem = await Preset.findById(discussion.linkedTo.refId)
          .populate("afterImage")
          .populate("beforeImage");
      } else if (discussion.linkedTo.type === "filmsim") {
        linkedItem = await FilmSim.findById(discussion.linkedTo.refId).populate(
          "sampleImages"
        );
      }

      return {
        type: discussion.linkedTo.type.toUpperCase(),
        refId: discussion.linkedTo.refId,
        preset: discussion.linkedTo.type === "preset" ? linkedItem : null,
        filmSim: discussion.linkedTo.type === "filmsim" ? linkedItem : null,
      };
    },
    createdAt: (discussion) => {
      return discussion.createdAt
        ? discussion.createdAt.toISOString()
        : new Date().toISOString();
    },
    updatedAt: (discussion) => {
      return discussion.updatedAt
        ? discussion.updatedAt.toISOString()
        : new Date().toISOString();
    },
  },

  DiscussionPost: {
    timestamp: (post) => {
      return post.timestamp
        ? post.timestamp.toISOString()
        : new Date().toISOString();
    },
    editedAt: (post) => {
      return post.editedAt ? post.editedAt.toISOString() : null;
    },
  },

  DiscussionReply: {
    timestamp: (reply) => {
      return reply.timestamp
        ? reply.timestamp.toISOString()
        : new Date().toISOString();
    },
    editedAt: (reply) => {
      return reply.editedAt ? reply.editedAt.toISOString() : null;
    },
  },

  // DiscussionPost resolver removed - posts are now embedded in discussions
};

module.exports = discussionResolvers;
