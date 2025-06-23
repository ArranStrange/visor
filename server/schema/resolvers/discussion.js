const Discussion = require("../../models/Discussion");
const DiscussionPost = require("../../models/DiscussionPost");
const User = require("../../models/User");
const Preset = require("../../models/Preset");
const FilmSim = require("../../models/FilmSim");
const {
  AuthenticationError,
  UserInputError,
} = require("apollo-server-express");

// Helper function to parse mentions from content
const parseMentions = async (content) => {
  const mentions = [];

  // Parse @user mentions
  const userMentions = content.match(/@(\w+)/g);
  if (userMentions) {
    for (const mention of userMentions) {
      const username = mention.slice(1); // Remove @
      const user = await User.findOne({ username });
      if (user) {
        mentions.push({
          type: "user",
          refId: user._id,
          displayName: username,
        });
      }
    }
  }

  // Parse preset mentions (assuming format like "Portra 400" or similar)
  // This is a simplified version - you might want more sophisticated parsing
  const presetMentions = content.match(/(\w+(?:\s+\w+)*)/g);
  if (presetMentions) {
    for (const mention of presetMentions) {
      const preset = await Preset.findOne({
        title: { $regex: new RegExp(mention, "i") },
      });
      if (preset) {
        mentions.push({
          type: "preset",
          refId: preset._id,
          displayName: preset.title,
        });
      }

      const filmSim = await FilmSim.findOne({
        name: { $regex: new RegExp(mention, "i") },
      });
      if (filmSim) {
        mentions.push({
          type: "filmsim",
          refId: filmSim._id,
          displayName: filmSim.name,
        });
      }
    }
  }

  return mentions;
};

const discussionResolvers = {
  Query: {
    // Discussion queries
    getDiscussions: async (
      _,
      { page = 1, limit = 20, tags, type, search, createdBy }
    ) => {
      try {
        const skip = (page - 1) * limit;
        const query = { isActive: true };

        if (tags && tags.length > 0) {
          query.tags = { $in: tags };
        }

        if (type) {
          query["linkedTo.type"] = type.toLowerCase();
        }

        if (search) {
          query.$text = { $search: search };
        }

        if (createdBy) {
          query.createdBy = createdBy;
        }

        const [discussions, totalCount] = await Promise.all([
          Discussion.find(query)
            .sort({ lastActivity: -1 })
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

    // Post queries
    getPosts: async (_, { discussionId, page = 1, limit = 20, parentId }) => {
      try {
        const skip = (page - 1) * limit;
        const query = { discussionId, isDeleted: false };

        // If parentId is provided, get replies to that specific post
        // If parentId is null, get root-level posts (no parent)
        // If parentId is not provided, get all posts in the discussion
        if (parentId !== undefined) {
          query.parentId = parentId;
        }
        // If parentId is not provided, don't filter by parentId - get all posts

        const [posts, totalCount] = await Promise.all([
          DiscussionPost.find(query)
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .populate("author", "id username avatar")
            .populate("deletedBy", "id username"),
          DiscussionPost.countDocuments(query),
        ]);

        return {
          posts,
          totalCount,
          hasNextPage: skip + limit < totalCount,
          hasPreviousPage: page > 1,
        };
      } catch (error) {
        console.error("Error in getPosts:", error);
        if (error.name === "CastError") {
          throw new Error(`Invalid discussion ID format: ${discussionId}`);
        }
        throw new Error(`Failed to fetch posts: ${error.message}`);
      }
    },

    getPost: async (_, { id }) => {
      try {
        return await DiscussionPost.findById(id)
          .populate("author", "id username avatar")
          .populate("parent", "id content author")
          .populate("deletedBy", "id username");
      } catch (error) {
        throw new Error("Failed to fetch post");
      }
    },

    getPostsByAuthor: async (_, { authorId, page = 1, limit = 20 }) => {
      try {
        const skip = (page - 1) * limit;
        const [posts, totalCount] = await Promise.all([
          DiscussionPost.find({ author: authorId, isDeleted: false })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("discussionId", "id title"),
          DiscussionPost.countDocuments({ author: authorId, isDeleted: false }),
        ]);

        return {
          posts,
          totalCount,
          hasNextPage: skip + limit < totalCount,
          hasPreviousPage: page > 1,
        };
      } catch (error) {
        throw new Error("Failed to fetch posts");
      }
    },

    // Search
    searchDiscussions: async (_, { query, page = 1, limit = 20 }) => {
      try {
        const skip = (page - 1) * limit;
        const searchQuery = {
          $text: { $search: query },
          isActive: true,
        };

        const [discussions, totalCount] = await Promise.all([
          Discussion.find(searchQuery)
            .sort({ score: { $meta: "textScore" } })
            .skip(skip)
            .limit(limit)
            .populate("createdBy", "id username avatar"),
          Discussion.countDocuments(searchQuery),
        ]);

        return {
          discussions,
          totalCount,
          hasNextPage: skip + limit < totalCount,
          hasPreviousPage: page > 1,
        };
      } catch (error) {
        throw new Error("Failed to search discussions");
      }
    },

    searchPosts: async (_, { query, page = 1, limit = 20 }) => {
      try {
        const skip = (page - 1) * limit;
        const searchQuery = {
          $text: { $search: query },
          isDeleted: false,
        };

        const [posts, totalCount] = await Promise.all([
          DiscussionPost.find(searchQuery)
            .sort({ score: { $meta: "textScore" } })
            .skip(skip)
            .limit(limit)
            .populate("author", "id username avatar")
            .populate("discussionId", "id title"),
          DiscussionPost.countDocuments(searchQuery),
        ]);

        return {
          posts,
          totalCount,
          hasNextPage: skip + limit < totalCount,
          hasPreviousPage: page > 1,
        };
      } catch (error) {
        throw new Error("Failed to search posts");
      }
    },

    // User activity
    getFollowedDiscussions: async (_, { userId, page = 1, limit = 20 }) => {
      try {
        const skip = (page - 1) * limit;
        const [discussions, totalCount] = await Promise.all([
          Discussion.find({ followers: userId, isActive: true })
            .sort({ lastActivity: -1 })
            .skip(skip)
            .limit(limit)
            .populate("createdBy", "id username avatar"),
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
          .sort({ lastActivity: -1 })
          .limit(limit)
          .populate("createdBy", "id username avatar");
      } catch (error) {
        throw new Error("Failed to fetch recent discussions");
      }
    },

    getRecentPosts: async (_, { limit = 10 }) => {
      try {
        return await DiscussionPost.find({ isDeleted: false })
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate("author", "id username avatar")
          .populate("discussionId", "id title");
      } catch (error) {
        throw new Error("Failed to fetch recent posts");
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

        const { title, linkedToType, linkedToId, tags } = input;

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
          tags: tags || [],
          createdBy: user.id,
          followers: [user.id], // Auto-subscribe creator
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

        // Check if user is creator
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

        // Check if user is creator
        if (discussion.createdBy.toString() !== user.id) {
          throw new AuthenticationError("Not authorized");
        }

        await Discussion.findByIdAndUpdate(id, { isActive: false });
        return true;
      } catch (error) {
        throw new Error("Failed to delete discussion");
      }
    },

    // Following
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

        const { discussionId, parentId, content, imageUrl } = input;

        // Verify discussion exists
        const discussion = await Discussion.findById(discussionId);
        if (!discussion || !discussion.isActive) {
          throw new Error("Discussion not found or inactive");
        }

        // Parse mentions from content
        const mentions = await parseMentions(content);

        const post = new DiscussionPost({
          discussionId,
          parentId,
          author: user.id,
          content,
          imageUrl,
          mentions,
        });

        await post.save();

        // Update discussion stats
        await Discussion.findByIdAndUpdate(discussionId, {
          $inc: { postCount: 1 },
          lastActivity: new Date(),
        });

        return await DiscussionPost.findById(post._id)
          .populate("author", "id username avatar")
          .populate("parent", "id content author");
      } catch (error) {
        console.error("Error in createPost:", error);
        if (error.name === "ValidationError") {
          throw new Error(`Validation error: ${error.message}`);
        }
        if (error.name === "AuthenticationError") {
          throw error;
        }
        throw new Error(`Failed to create post: ${error.message}`);
      }
    },

    updatePost: async (_, { id, input }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError("Not authenticated");
        }

        const post = await DiscussionPost.findById(id);
        if (!post) {
          throw new Error("Post not found");
        }

        // Check if user is author
        if (post.author.toString() !== user.id) {
          throw new AuthenticationError("Not authorized");
        }

        // Parse mentions from new content
        const mentions = await parseMentions(input.content);

        const updatedPost = await DiscussionPost.findByIdAndUpdate(
          id,
          {
            ...input,
            mentions,
            isEdited: true,
            editedAt: new Date(),
          },
          { new: true }
        )
          .populate("author", "id username avatar")
          .populate("parent", "id content author");

        return updatedPost;
      } catch (error) {
        throw new Error("Failed to update post");
      }
    },

    deletePost: async (_, { id }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError("Not authenticated");
        }

        const post = await DiscussionPost.findById(id);
        if (!post) {
          throw new Error("Post not found");
        }

        // Check if user is author
        if (post.author.toString() !== user.id) {
          throw new AuthenticationError("Not authorized");
        }

        await DiscussionPost.findByIdAndUpdate(id, {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: user.id,
        });

        // Update discussion stats
        await Discussion.findByIdAndUpdate(post.discussionId, {
          $inc: { postCount: -1 },
        });

        return true;
      } catch (error) {
        throw new Error("Failed to delete post");
      }
    },

    // Reactions
    addReaction: async (_, { input }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError("Not authenticated");
        }

        const { postId, emoji } = input;

        const post = await DiscussionPost.findById(postId);
        if (!post) {
          throw new Error("Post not found");
        }

        // Find or create reaction
        let reaction = post.reactions.find((r) => r.emoji === emoji);
        if (reaction) {
          // Add user to existing reaction if not already there
          if (!reaction.users.includes(user.id)) {
            reaction.users.push(user.id);
          }
        } else {
          // Create new reaction
          post.reactions.push({
            emoji,
            users: [user.id],
          });
        }

        await post.save();

        return await DiscussionPost.findById(postId)
          .populate("author", "id username avatar")
          .populate("parent", "id content author");
      } catch (error) {
        throw new Error("Failed to add reaction");
      }
    },

    removeReaction: async (_, { input }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError("Not authenticated");
        }

        const { postId, emoji } = input;

        const post = await DiscussionPost.findById(postId);
        if (!post) {
          throw new Error("Post not found");
        }

        // Find reaction and remove user
        const reaction = post.reactions.find((r) => r.emoji === emoji);
        if (reaction) {
          reaction.users = reaction.users.filter(
            (userId) => userId.toString() !== user.id
          );

          // Remove reaction if no users left
          if (reaction.users.length === 0) {
            post.reactions = post.reactions.filter((r) => r.emoji !== emoji);
          }
        }

        await post.save();

        return await DiscussionPost.findById(postId)
          .populate("author", "id username avatar")
          .populate("parent", "id content author");
      } catch (error) {
        throw new Error("Failed to remove reaction");
      }
    },
  },

  // Field resolvers
  Discussion: {
    linkedTo: async (discussion) => {
      const linkedItem =
        discussion.linkedTo.type === "preset"
          ? await Preset.findById(discussion.linkedTo.refId)
          : await FilmSim.findById(discussion.linkedTo.refId);

      return {
        type: discussion.linkedTo.type.toUpperCase(),
        refId: discussion.linkedTo.refId,
        preset: discussion.linkedTo.type === "preset" ? linkedItem : null,
        filmSim: discussion.linkedTo.type === "filmsim" ? linkedItem : null,
      };
    },
  },

  DiscussionPost: {
    parent: async (post) => {
      if (!post.parentId) return null;
      return await DiscussionPost.findById(post.parentId).populate(
        "author",
        "id username avatar"
      );
    },
  },

  Mention: {
    user: async (mention) => {
      if (mention.type !== "user") return null;
      return await User.findById(mention.refId);
    },
    preset: async (mention) => {
      if (mention.type !== "preset") return null;
      return await Preset.findById(mention.refId);
    },
    filmSim: async (mention) => {
      if (mention.type !== "filmsim") return null;
      return await FilmSim.findById(mention.refId);
    },
  },

  Reaction: {
    count: (reaction) => reaction.users.length,
  },
};

module.exports = discussionResolvers;
