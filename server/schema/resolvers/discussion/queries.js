const Discussion = require("../../../models/Discussion");
const { createLogger } = require("../../../utils/logger");
const { clampPagination } = require("../../../utils/pagination");
const { escapeRegExp } = require("../../../utils/escapeRegExp");

const logger = createLogger("resolvers:discussion");

module.exports = {
  getDiscussions: async (_, { page, limit, type, search, createdBy }) => {
    try {
      const { page: safePage, limit: safeLimit, skip } = clampPagination(
        page,
        limit
      );
      const query = { isActive: true };

      if (type) {
        query["linkedTo.type"] = type.toLowerCase();
      }

      if (search) {
        const searchRegex = new RegExp(escapeRegExp(search), "i");

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
          .limit(safeLimit)
          .populate("createdBy", "id username avatar")
          .populate("followers", "id username avatar"),
        Discussion.countDocuments(query),
      ]);

      return {
        discussions,
        totalCount,
        hasNextPage: skip + safeLimit < totalCount,
        hasPreviousPage: safePage > 1,
      };
    } catch (error) {
      logger.error("Error in getDiscussions", error);
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

  // Search
  searchDiscussions: async (_, { query, page, limit }) => {
    try {
      const { page: safePage, limit: safeLimit, skip } = clampPagination(
        page,
        limit
      );
      const searchRegex = new RegExp(escapeRegExp(query), "i");

      // Search in discussion titles and embedded posts
      const searchQuery = {
        isActive: true,
        $or: [{ title: searchRegex }, { "posts.content": searchRegex }],
      };

      const [discussions, totalCount] = await Promise.all([
        Discussion.find(searchQuery)
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(safeLimit)
          .populate("createdBy", "id username avatar")
          .populate("followers", "id username avatar"),
        Discussion.countDocuments(searchQuery),
      ]);

      return {
        discussions,
        totalCount,
        hasNextPage: skip + safeLimit < totalCount,
        hasPreviousPage: safePage > 1,
      };
    } catch (error) {
      logger.error("Error in searchDiscussions", error);
      throw new Error("Failed to search discussions");
    }
  },

  // User activity
  getFollowedDiscussions: async (_, { userId, page, limit }) => {
    try {
      const { page: safePage, limit: safeLimit, skip } = clampPagination(
        page,
        limit
      );
      const [discussions, totalCount] = await Promise.all([
        Discussion.find({ followers: userId, isActive: true })
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(safeLimit)
          .populate("createdBy", "id username avatar")
          .populate("followers", "id username avatar"),
        Discussion.countDocuments({ followers: userId, isActive: true }),
      ]);

      return {
        discussions,
        totalCount,
        hasNextPage: skip + safeLimit < totalCount,
        hasPreviousPage: safePage > 1,
      };
    } catch (error) {
      throw new Error("Failed to fetch followed discussions");
    }
  },

  getRecentDiscussions: async (_, { limit }) => {
    try {
      const { limit: safeLimit } = clampPagination(1, limit, {
        defaultLimit: 10,
      });
      return await Discussion.find({ isActive: true })
        .sort({ updatedAt: -1 })
        .limit(safeLimit)
        .populate("createdBy", "id username avatar")
        .populate("followers", "id username avatar");
    } catch (error) {
      throw new Error("Failed to fetch recent discussions");
    }
  },
};
