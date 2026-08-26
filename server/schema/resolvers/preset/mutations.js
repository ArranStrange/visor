const Preset = require("../../../models/Preset");
const { UserInputError } = require("../../../utils/errors");
const { createLogger } = require("../../../utils/logger");
const {
  requireAdmin,
  requireAuth,
  requireOwnership,
} = require("../../../utils/authHelpers");
const {
  cleanSettings,
  cleanToneCurve,
  cleanComprehensiveSettings,
  formatToneCurvePoints,
} = require("./services/presetSettings");
const {
  createTagDocuments,
  generateUniqueSlug,
  attachPresetImages,
  createDiscussionForPreset,
} = require("./services/presetUpload");

const logger = createLogger("resolvers:preset");

module.exports = {
  createPreset: async (_, { input }, { user }) => {
    try {
      requireAuth(user, "Authentication required");
      if (!input.title) throw new Error("Title is required");
      if (!input.slug) throw new Error("Slug is required");
      if (!input.xmpUrl) throw new Error("XMP URL is required");
      const existingPreset = await Preset.findOne({ slug: input.slug });
      if (existingPreset)
        throw new Error("A preset with this slug already exists");
      const settings = input.settings || {};
      const presetData = {
        ...input,
        creator: user.id,
        settings: cleanSettings(settings),

        toneCurve: input.toneCurve
          ? {
              rgb: formatToneCurvePoints(input.toneCurve.rgb),
              red: formatToneCurvePoints(input.toneCurve.red),
              green: formatToneCurvePoints(input.toneCurve.green),
              blue: formatToneCurvePoints(input.toneCurve.blue),
            }
          : undefined,
      };
      const preset = await Preset.create(presetData);
      return preset;
    } catch (error) {
      logger.error("Error creating preset", error);
      throw error;
    }
  },

  updatePreset: async (_, { id, input }, { user }) => {
    requireAuth(user, "You must be logged in to update a preset");
    const preset = await Preset.findById(id);
    if (!preset) throw new Error("Preset not found");
    requireOwnership(user, preset, "creator", {
      // Admins could always edit presets (unlike film sims and lists).
      allowAdmin: true,
      message: "Not authorized to update this preset",
    });
    return await Preset.findByIdAndUpdate(id, input, { new: true });
  },

  deletePreset: async (_, { id }, { user }) => {
    requireAuth(user, "You must be logged in to delete a preset");
    const preset = await Preset.findById(id);
    if (!preset) return false;
    requireOwnership(user, preset, "creator", {
      allowAdmin: true,
      message: "Not authorized to delete this preset",
    });
    return !!(await Preset.findByIdAndDelete(id));
  },

  likePreset: async (_, { presetId }, { user }) => {
    const preset = await Preset.findById(presetId);
    if (!preset.likes.includes(user.id)) {
      preset.likes.push(user.id);
      await preset.save();
    }
    return true;
  },

  downloadPreset: async (_, { presetId }) => {
    const preset = await Preset.findById(presetId);
    preset.downloads += 1;
    await preset.save();
    return true;
  },

  uploadPreset: async (
    _,
    {
      title,
      description,
      settings,
      toneCurve,
      notes,
      tags,
      beforeImage,
      afterImage,
      sampleImages,
      xmpUrl,

      cameraProfileDigest,
      profileName,
      lookTableName,
      version,
      processVersion,
      cameraProfile,
      whiteBalance,
      colorGrading: colorGradingParam,
      lensCorrections,
      optics,
      transform,
      effects,
      calibration,
      crop,
      orientation,
      metadata,
      hasSettings,
      rawFileName,
      snapshot,
    },
    { user }
  ) => {
    if (!user) {
      logger.error("No user found in context");
    }
    requireAuth(user, "You must be logged in to upload a preset");

    try {
      const tagDocuments = await createTagDocuments(tags);

      const slug = await generateUniqueSlug(Preset, title);

      const colorGradingFromSettings =
        settings && settings.colorGrading ? settings.colorGrading : null;
      const finalColorGrading = colorGradingFromSettings || colorGradingParam;

      const comprehensiveSettings = cleanComprehensiveSettings({
        cameraProfileDigest,
        profileName,
        lookTableName,
        version,
        processVersion,
        cameraProfile,
        whiteBalance,
        colorGrading: finalColorGrading,
        lensCorrections,
        optics,
        transform,
        effects,
        calibration,
        crop,
        orientation,
        metadata,
        hasSettings,
        rawFileName,
        snapshot,
      });

      const preset = new Preset({
        title,
        description,
        xmpUrl,
        settings: cleanSettings(settings),
        toneCurve: cleanToneCurve(toneCurve),
        notes,
        tags: tagDocuments,
        creator: user._id,
        slug,
        ...comprehensiveSettings,
      });

      await preset.save();

      await attachPresetImages(
        preset,
        { beforeImage, afterImage, sampleImages },
        user
      );

      await preset.save();

      const finalPreset = await Preset.findById(preset._id)
        .populate("creator")
        .populate("tags")
        .populate("beforeImage")
        .populate("afterImage")
        .populate("sampleImages");

      if (!finalPreset) {
        throw new Error("Preset not found after save");
      }

      await createDiscussionForPreset({
        title,
        tags,
        presetId: preset._id,
        user,
      });

      return finalPreset;
    } catch (error) {
      logger.error("Error in uploadPreset resolver", error);
      throw new Error(`Failed to upload preset: ${error.message}`);
    }
  },

  makePresetFeatured: async (_, { presetId }, { user }) => {
    requireAdmin(user, "Only administrators can feature presets");

    try {
      // First, unfeature all other presets
      await Preset.updateMany(
        { _id: { $ne: presetId } },
        { $set: { featured: false } }
      );

      const preset = await Preset.findById(presetId);
      if (!preset) {
        throw new UserInputError("Preset not found");
      }

      preset.featured = true;
      await preset.save();

      return preset;
    } catch (error) {
      logger.error("Make preset featured error", error);
      throw new Error("Failed to feature preset");
    }
  },

  removePresetFeatured: async (_, { presetId }, { user }) => {
    requireAdmin(user, "Only administrators can remove featured status");

    try {
      const preset = await Preset.findById(presetId);
      if (!preset) {
        throw new UserInputError("Preset not found");
      }

      preset.featured = false;
      await preset.save();

      return preset;
    } catch (error) {
      logger.error("Remove preset featured error", error);
      throw new Error("Failed to remove featured status");
    }
  },
};
