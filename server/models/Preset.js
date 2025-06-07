const mongoose = require("mongoose");

const presetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    xmpUrl: {
      type: String, // URL or path to the uploaded .xmp file
      required: true,
    },
    settings: {
      type: Map,
      of: mongoose.Schema.Types.Mixed, // parsed .xmp values (exposure, contrast, etc.)
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    sampleImages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
      },
    ],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filmSim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FilmSim",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downloads: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Preset", presetSchema);
