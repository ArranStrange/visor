const mongoose = require("mongoose");
const { Schema } = mongoose;

const filmSimSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: String,

    type: {
      type: String,
      enum: ["fujifilm-native", "custom-recipe"],
      default: "custom-recipe",
    },

    approximationSettings: {
      type: Map,
      of: Schema.Types.Mixed, // e.g., Lightroom sliders approximating the sim
    },

    toneCurve: {
      rgb: [Number],
      red: [Number],
      green: [Number],
      blue: [Number],
    },

    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],

    sampleImages: [{ type: Schema.Types.ObjectId, ref: "Image" }],

    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    recommendedPresets: [{ type: Schema.Types.ObjectId, ref: "Preset" }],

    compatibleCameras: [String], // e.g., ["X100V", "X-T4"], could also ref Camera model later

    notes: String,

    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],

    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("FilmSim", filmSimSchema);
