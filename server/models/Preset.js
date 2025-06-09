const mongoose = require("mongoose");
const { Schema } = mongoose;

const presetSchema = new Schema(
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
      type: String, // Path or URL to the uploaded .xmp file
      required: true,
    },

    settings: {
      type: Map,
      of: Schema.Types.Mixed, // e.g. exposure, contrast, etc.
    },

    toneCurve: {
      rgb: [Number],
      red: [Number],
      green: [Number],
      blue: [Number],
    },

    notes: String, // Creator's notes

    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],

    sampleImages: [{ type: Schema.Types.ObjectId, ref: "Image" }],

    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    filmSim: {
      type: Schema.Types.ObjectId,
      ref: "FilmSim",
    },

    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],

    downloads: {
      type: Number,
      default: 0,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Preset", presetSchema);
