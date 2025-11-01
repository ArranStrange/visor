const Tag = require("../../models/Tag");
const Preset = require("../../models/Preset");
const FilmSim = require("../../models/FilmSim");

module.exports = {
  Query: {
    allTags: async () => {
      const tags = await Tag.find({});
      return tags.map((tag) => tag.displayName);
    },
    getTag: async (_, { name }) => await Tag.findOne({ name }),
    listTags: async (_, { category }) =>
      await Tag.find(category ? { category } : {}),
    searchTags: async (_, { search, category, limit }) => {
      // First, find all tag IDs that are actually used in presets or film sims
      const [presetTags, filmSimTags] = await Promise.all([
        Preset.distinct("tags"),
        FilmSim.distinct("tags"),
      ]);

      // Combine and get unique tag IDs that are actually used
      // Filter out null/undefined values and convert to strings for Set
      const allTagIds = [...presetTags, ...filmSimTags].filter(
        (id) => id != null
      );
      const usedTagIds = [...new Set(allTagIds.map((id) => id.toString()))];

      // If no tags are used, return empty array
      if (usedTagIds.length === 0) {
        return [];
      }

      // Convert string IDs back to ObjectIds for MongoDB query
      const mongoose = require("mongoose");
      const usedTagObjectIds = usedTagIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (usedTagObjectIds.length === 0) {
        return [];
      }

      // Build query for tags that exist AND are used
      const queryConditions = [{ _id: { $in: usedTagObjectIds } }];

      if (category) {
        queryConditions.push({ category });
      }

      if (search && search.trim().length > 0) {
        const searchRegex = new RegExp(search.trim(), "i");
        queryConditions.push({
          $or: [{ name: searchRegex }, { displayName: searchRegex }],
        });
      }

      const query =
        queryConditions.length > 1
          ? { $and: queryConditions }
          : queryConditions[0];

      let tagQuery = Tag.find(query);

      if (limit && limit > 0) {
        tagQuery = tagQuery.limit(limit);
      }

      const tags = await tagQuery.exec();

      // Only return tags that actually exist in the database and are valid
      // Filter out any null/undefined or invalid tags
      return tags
        .filter((tag) => {
          // Ensure tag exists and has required fields
          if (!tag || !tag._id) return false;
          if (!tag.displayName || typeof tag.displayName !== "string")
            return false;
          if (!tag.name || typeof tag.name !== "string") return false;
          if (tag.displayName.trim().length === 0) return false;
          if (tag.name.trim().length === 0) return false;
          return true;
        })
        .map((tag) => ({
          id: tag._id.toString(),
          name: tag.name.trim(),
          displayName: tag.displayName.trim(),
        }));
    },
  },
};
