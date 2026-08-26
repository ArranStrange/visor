const Preset = require("../../../models/Preset");
const { createLogger } = require("../../../utils/logger");
const { clampPagination } = require("../../../utils/pagination");
const {
  buildContentSort,
  buildPresetListQuery,
} = require("../../../utils/contentFilters");

const logger = createLogger("resolvers:preset");

module.exports = {
  getPreset: async (_, { slug }) => {
    try {
      const preset = await Preset.findOne({ slug })
        .populate({ path: "creator", select: "id username avatar instagram" })
        .populate({ path: "tags", select: "id name displayName" })
        .populate({ path: "beforeImage", select: "id url publicId" })
        .populate({ path: "afterImage", select: "id url publicId" })
        .populate({ path: "sampleImages", select: "id url caption" });
      if (!preset) throw new Error("Preset not found");
      const presetObj = preset.toObject();
      return {
        ...presetObj,
        id: presetObj._id.toString(),
        creator: {
          ...presetObj.creator,
          id: presetObj.creator._id.toString(),
        },
        tags: presetObj.tags.map((tag) => ({
          ...tag,
          id: tag._id.toString(),
        })),
        beforeImage: presetObj.beforeImage
          ? {
              ...presetObj.beforeImage,
              id: presetObj.beforeImage._id.toString(),
            }
          : null,
        afterImage: presetObj.afterImage
          ? {
              ...presetObj.afterImage,
              id: presetObj.afterImage._id.toString(),
            }
          : null,
        sampleImages: presetObj.sampleImages.map((image) => ({
          ...image,
          id: image._id.toString(),
        })),
      };
    } catch (error) {
      logger.error("Error in getPreset", error);
      throw error;
    }
  },

  getPresetById: async (_, { id }) => await Preset.findById(id),

  listPresets: async (_, { filter, where, search, sort, page, limit }) => {
    try {
      const { page: safePage, limit: safeLimit, skip } = clampPagination(
        page,
        limit
      );

      // One query object for both the count and the page. The after-image
      // predicate used to be applied in JS *after* paging, so the total
      // counted presets the grid then dropped: the count disagreed with what
      // was shown and a page could come back short (#119).
      const query = await buildPresetListQuery({ filter, where, search });

      const [presets, totalCount] = await Promise.all([
        Preset.find(query)
          .populate({ path: "creator", select: "id username avatar" })
          .populate({ path: "tags", select: "id name displayName" })
          .populate({ path: "filmSim", select: "id name slug" })
          .populate({ path: "afterImage", select: "id url publicId" })
          .populate({ path: "beforeImage", select: "id url publicId" })
          .populate({ path: "sampleImages", select: "id url caption" })
          .sort(buildContentSort(sort))
          .skip(skip)
          .limit(safeLimit),
        Preset.countDocuments(query),
      ]);

      const serializedPresets = presets.map((preset) => {
        const presetObj = preset.toObject();
        return {
          ...presetObj,
          id: presetObj._id.toString(),
          creator: presetObj.creator
            ? {
                ...presetObj.creator,
                id: presetObj.creator._id?.toString() || presetObj.creator.id,
              }
            : null,
          tags: (presetObj.tags || []).map((tag) => ({
            ...tag,
            id: tag._id?.toString() || tag.id,
          })),
        };
      });

      const totalPages = Math.ceil(totalCount / safeLimit);
      const hasNextPage = safePage < totalPages;
      const hasPreviousPage = safePage > 1;

      return {
        presets: serializedPresets,
        totalCount,
        hasNextPage,
        hasPreviousPage,
        currentPage: safePage,
        totalPages,
      };
    } catch (error) {
      logger.error("Error listing presets", error);
      throw new Error("Failed to list presets: " + error.message);
    }
  },
};
