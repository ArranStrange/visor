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

    settings: {
      dynamicRange: { type: Number, default: 100 },
      highlight: { type: Number, default: 0 },
      shadow: { type: Number, default: 0 },
      colour: { type: Number, default: 0 },
      sharpness: { type: Number, default: 0 },
      noiseReduction: { type: Number, default: 0 },
      grainEffect: { type: Number, default: 0 },
      clarity: { type: Number, default: 0 },
      whiteBalance: { type: String, default: "auto" },
      wbShift: {
        r: { type: Number, default: 0 },
        b: { type: Number, default: 0 },
      },
    },

    toneCurve: {
      rgb: [Number],
      red: [Number],
      green: [Number],
      blue: [Number],
    },

    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],

    sampleImages: [{ type: Schema.Types.ObjectId, ref: "Image" }],

    thumbnail: String, // URL to the thumbnail image

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
