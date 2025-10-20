const Image = require("../../models/Image");

const imageResolvers = {
  Query: {
    getImage: async (_, { id }) => await Image.findById(id),
    listImagesByPreset: async (_, { presetId }) =>
      await Image.find({ preset: presetId }),
    getFeaturedPhoto: async () => {
      return await Image.findOne({ isFeaturedPhoto: true }).populate(
        "uploader"
      );
    },
  },
  Mutation: {
    makeFeaturedPhoto: async (_, { imageId }, context) => {
      // Check if user is admin
      if (!context.user || !context.user.isAdmin) {
        throw new Error("Only administrators can set featured photos");
      }

      // Remove featured status from any existing featured photo
      await Image.updateMany(
        { isFeaturedPhoto: true },
        { $set: { isFeaturedPhoto: false } }
      );

      // Set the new featured photo
      const image = await Image.findByIdAndUpdate(
        imageId,
        { $set: { isFeaturedPhoto: true } },
        { new: true }
      ).populate("uploader");

      if (!image) {
        throw new Error("Image not found");
      }

      return image;
    },
    removeFeaturedPhoto: async (_, { imageId }, context) => {
      // Check if user is admin
      if (!context.user || !context.user.isAdmin) {
        throw new Error("Only administrators can remove featured photos");
      }

      const image = await Image.findByIdAndUpdate(
        imageId,
        { $set: { isFeaturedPhoto: false } },
        { new: true }
      ).populate("uploader");

      if (!image) {
        throw new Error("Image not found");
      }

      return image;
    },
  },
};

module.exports = imageResolvers;
