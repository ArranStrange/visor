const Preset = require("../../../models/Preset");
const { createLogger } = require("../../../utils/logger");
const { clampPagination } = require("../../../utils/pagination");
const { buildPresetFilterQuery } = require("../../../utils/contentFilters");

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

  listPresets: async (_, { filter, where, page, limit }) => {
    try {
      const { page: safePage, limit: safeLimit, skip } = clampPagination(
        page,
        limit
      );

      const query = buildPresetFilterQuery(filter, where);

      const totalCount = await Preset.countDocuments(query);

      const presets = await Preset.find(query)
        .populate({ path: "creator", select: "id username avatar" })
        .populate({ path: "tags", select: "id name displayName" })
        .populate({ path: "filmSim", select: "id name slug" })
        .populate({ path: "afterImage", select: "id url publicId" })
        .populate({ path: "beforeImage", select: "id url publicId" })
        .populate({ path: "sampleImages", select: "id url caption" })
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(safeLimit);

      // Filter out presets without afterImage and serialize properly
      const filteredPresets = presets
        .filter((preset) => preset.afterImage && preset.afterImage.url)
        .map((preset) => {
          const presetObj = preset.toObject();
          return {
            ...presetObj,
            id: presetObj._id.toString(),
            creator: presetObj.creator
              ? {
                  ...presetObj.creator,
                  id:
                    presetObj.creator._id?.toString() || presetObj.creator.id,
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
        presets: filteredPresets,
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
