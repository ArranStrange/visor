const UserList = require("../../../models/UserList");
const Preset = require("../../../models/Preset");
const FilmSim = require("../../../models/FilmSim");
const Tag = require("../../../models/Tag");
const { createLogger } = require("../../../utils/logger");
const { clampPagination } = require("../../../utils/pagination");
const {
  serializeUserListSummary,
  serializeUserListDetail,
} = require("./services/listSerializers");

const logger = createLogger("resolvers:list");

module.exports = {
  featuredUserLists: async () => {
    try {
      const lists = await UserList.find({ isPublic: true, isFeatured: true })
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate("owner", "id username avatar")
        .populate({
          path: "presets",
          select: "id title slug afterImage",
          populate: [{ path: "afterImage", select: "id url" }],
        })
        .populate({
          path: "filmSims",
          select: "id name slug sampleImages",
          populate: { path: "sampleImages", select: "id url" },
        });

      return lists.map(serializeUserListSummary);
    } catch (e) {
      logger.error("Error fetching featured lists", e);
      throw new Error("Failed to fetch featured lists");
    }
  },

  browseUserLists: async (_, { search = "", page, limit }) => {
    try {
      const { page: safePage, limit: safeLimit, skip } = clampPagination(
        page,
        limit
      );

      // Build base query for public lists only
      let query = { isPublic: true };

      // If there's a search term, we need to search across multiple fields
      if (search && search.trim().length > 0) {
        const searchTerm = search.trim();
        const searchRegex = new RegExp(searchTerm, "i");

        // Find matching presets by title or tags
        const matchingPresets = await Preset.find({
          $or: [{ title: searchRegex }],
        }).select("_id");

        const matchingPresetIds = matchingPresets.map((p) => p._id);

        // Find matching film sims by name
        const matchingFilmSims = await FilmSim.find({
          name: searchRegex,
        }).select("_id");

        const matchingFilmSimIds = matchingFilmSims.map((f) => f._id);

        // Find matching tags
        const matchingTags = await Tag.find({
          $or: [{ name: searchRegex }, { displayName: searchRegex }],
        }).select("_id");

        const matchingTagIds = matchingTags.map((t) => t._id);

        // Find presets that have matching tags
        const presetsWithTags = await Preset.find({
          tags: { $in: matchingTagIds },
        }).select("_id");

        const presetIdsWithTags = presetsWithTags.map((p) => p._id);

        // Combine all matching preset IDs
        const allMatchingPresetIds = [
          ...new Set([...matchingPresetIds, ...presetIdsWithTags]),
        ];

        // Search in list names, descriptions, or lists containing matching presets/filmsims
        query.$or = [
          { name: searchRegex },
          { description: searchRegex },
          { presets: { $in: allMatchingPresetIds } },
          { filmSims: { $in: matchingFilmSimIds } },
        ];
      }

      // Get lists with pagination
      const [lists, totalCount] = await Promise.all([
        UserList.find(query)
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(safeLimit)
          .populate("owner", "id username avatar")
          .populate({
            path: "presets",
            select: "id title slug afterImage",
            populate: [{ path: "afterImage", select: "id url" }],
          })
          .populate({
            path: "filmSims",
            select: "id name slug sampleImages",
            populate: { path: "sampleImages", select: "id url" },
          }),
        UserList.countDocuments(query),
      ]);

      const formattedLists = lists.map(serializeUserListSummary);

      return {
        lists: formattedLists,
        totalCount,
        hasNextPage: skip + safeLimit < totalCount,
        hasPreviousPage: safePage > 1,
      };
    } catch (error) {
      logger.error("Error browsing user lists", error);
      throw new Error("Failed to browse user lists: " + error.message);
    }
  },

  getUserLists: async (_, { userId }) => {
    try {
      const lists = await UserList.find({ owner: userId })
        .populate({
          path: "presets",
          select: "id title slug afterImage",
          populate: {
            path: "afterImage",
            select: "id url",
          },
        })
        .populate({
          path: "filmSims",
          select: "id name slug sampleImages",
          populate: {
            path: "sampleImages",
            select: "id url",
          },
        });

      return lists.map((list) => {
        const listObj = list.toObject();
        return {
          ...listObj,
          id: listObj._id.toString(),
          owner: {
            id: listObj.owner.toString(),
            username: listObj.owner.username || "",
          },
          presets:
            listObj.presets?.map((preset) => ({
              ...preset,
              id: preset._id.toString(),
              afterImage:
                preset.afterImage && preset.afterImage._id
                  ? preset.afterImage
                  : null,
            })) || [],
          filmSims:
            listObj.filmSims?.map((filmSim) => ({
              ...filmSim,
              id: filmSim._id.toString(),
              sampleImages: filmSim.sampleImages || [],
            })) || [],
        };
      });
    } catch (error) {
      logger.error("Error getting user lists", error);
      throw new Error("Failed to get user lists: " + error.message);
    }
  },

  getUserList: async (_, { id }) => {
    try {
      const list = await UserList.findById(id)
        .populate({
          path: "presets",
          select: "id title slug afterImage",
          populate: {
            path: "afterImage",
            select: "id url",
          },
        })
        .populate({
          path: "filmSims",
          select: "id name slug sampleImages",
          populate: {
            path: "sampleImages",
            select: "id url",
          },
        })
        .populate("owner", "id username");

      if (!list) {
        throw new Error("List not found");
      }

      return serializeUserListDetail(list);
    } catch (error) {
      logger.error("Error getting user list", error);
      throw new Error("Failed to get user list: " + error.message);
    }
  },
};
