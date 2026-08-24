const Tag = require("../../../../models/Tag");
const Image = require("../../../../models/Image");
const Discussion = require("../../../../models/Discussion");
const { createLogger } = require("../../../../utils/logger");

const logger = createLogger("resolvers:preset:upload");

const createTagDocuments = async (tagNames) => {
  return Promise.all(
    (tagNames || []).map(async (tagName) => {
      try {
        const tag = await Tag.findOneAndUpdate(
          { name: tagName.toLowerCase() },
          {
            name: tagName.toLowerCase(),
            displayName: tagName,
          },
          { upsert: true, new: true }
        );
        return tag._id;
      } catch (error) {
        logger.error(`Error creating tag: ${tagName}`, error);
        throw error;
      }
    })
  );
};

const generateUniqueSlug = async (Preset, title) => {
  const baseSlug = title.toLowerCase().replace(/\s+/g, "-");
  let slug = baseSlug;
  while (await Preset.findOne({ slug })) {
    slug = `${baseSlug}-${Date.now()}`;
  }
  return slug;
};

const attachPresetImages = async (
  preset,
  { beforeImage, afterImage, sampleImages },
  user
) => {
  if (beforeImage) {
    try {
      const beforeImageDoc = new Image({
        url: beforeImage.url,
        publicId: beforeImage.publicId,
        uploader: user._id,
        isBeforeImage: true,
        associatedWith: { kind: "Preset", item: preset._id },
        submittedAt: new Date(),
      });
      await beforeImageDoc.save();
      preset.beforeImage = beforeImageDoc._id;
    } catch (error) {
      logger.error("Error saving before image", error);
      throw error;
    }
  }

  if (afterImage) {
    try {
      const afterImageDoc = new Image({
        url: afterImage.url,
        publicId: afterImage.publicId,
        uploader: user._id,
        isAfterImage: true,
        associatedWith: { kind: "Preset", item: preset._id },
        submittedAt: new Date(),
      });
      await afterImageDoc.save();
      preset.afterImage = afterImageDoc._id;
    } catch (error) {
      logger.error("Error saving after image", error);
      throw error;
    }
  }

  if (sampleImages && sampleImages.length > 0) {
    try {
      const sampleImageDocs = await Promise.all(
        sampleImages.map(async (image) => {
          const imageDoc = new Image({
            url: image.url,
            publicId: image.publicId,
            uploader: user._id,
            associatedWith: { kind: "Preset", item: preset._id },
            submittedAt: new Date(),
          });
          await imageDoc.save();
          return imageDoc._id;
        })
      );
      preset.sampleImages = sampleImageDocs;
    } catch (error) {
      logger.error("Error saving sample images", error);
      throw error;
    }
  }
};

const createDiscussionForPreset = async ({ title, tags, presetId, user }) => {
  try {
    const discussion = new Discussion({
      title: `Discussion: ${title}`,
      linkedTo: {
        type: "preset",
        refId: presetId,
      },
      tags: tags || [],
      createdBy: user._id,
      followers: [user._id],
    });

    await discussion.save();
  } catch (discussionError) {
    logger.error("Error creating discussion for preset", discussionError);
  }
};

module.exports = {
  createTagDocuments,
  generateUniqueSlug,
  attachPresetImages,
  createDiscussionForPreset,
};
