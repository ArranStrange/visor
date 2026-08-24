const User = require("../../../models/User");
const Tag = require("../../../models/Tag");
const FilmSim = require("../../../models/FilmSim");
const Image = require("../../../models/Image");

module.exports = {
  creator: async (preset) => await User.findById(preset.creator),
  tags: async (preset) => await Tag.find({ _id: { $in: preset.tags } }),
  filmSim: async (preset) => await FilmSim.findById(preset.filmSim),
  sampleImages: async (preset) =>
    await Image.find({ _id: { $in: preset.sampleImages } }),
};
