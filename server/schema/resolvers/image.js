const Image = require("../../models/Image");

const imageResolvers = {
  Query: {
    getImage: async (_, { id }) => await Image.findById(id),
    listImagesByPreset: async (_, { presetId }) =>
      await Image.find({ preset: presetId }),
  },
};

module.exports = imageResolvers;
