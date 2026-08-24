const Tag = require("../../../../models/Tag");
const Image = require("../../../../models/Image");
const Discussion = require("../../../../models/Discussion");
const { createLogger } = require("../../../../utils/logger");

const logger = createLogger("resolvers:filmSim:upload");

const createFilmSimTags = async (tagNames) => {
  return Promise.all(
    (tagNames || []).map(async (tagName) => {
      const existingTag = await Tag.findOneAndUpdate(
        { name: tagName.toLowerCase() },
        {
          name: tagName.toLowerCase(),
          displayName: tagName,
          category: "filmsim",
        },
        { new: true, upsert: true }
      );
      return existingTag._id;
    })
  );
};

const slugifyFilmSimName = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const attachFilmSimSampleImages = async (
  filmSim,
  sampleImages,
  user,
  { name, tags } = {}
) => {
  if (!sampleImages || sampleImages.length === 0) return;

  const images = await Promise.all(
    sampleImages.map(async (image) => {
      const imageDoc = await Image.create({
        url: image.url,
        publicId: image.publicId,
        uploader: user._id,
        associatedWith: {
          kind: "FilmSim",
          item: filmSim._id,
        },
      });
      return imageDoc._id;
    })
  );

  filmSim.sampleImages = images.map((img) => img._id);
  await filmSim.save();

  try {
    const discussion = new Discussion({
      title: `Discussion: ${name}`,
      linkedTo: {
        type: "filmsim",
        refId: filmSim._id,
      },
      tags: tags || [],
      createdBy: user._id,
      followers: [user._id], // Auto-subscribe creator
    });

    await discussion.save();
  } catch (discussionError) {
    logger.error("Error creating discussion for film sim", discussionError);
  }
};

module.exports = {
  createFilmSimTags,
  slugifyFilmSimName,
  attachFilmSimSampleImages,
};
