const mongoose = require("mongoose");

const filmSimSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["Fujifilm", "Custom"],
      required: true,
    },
    description: String,
    toneProfile: String, // e.g. "warm", "neutral", "contrast-heavy"
    colorProfile: String, // e.g. "vibrant", "muted", "classic chrome"
    history: String, // historical or brand background
    recommendedSettings: {
      type: Map,
      of: mongoose.Schema.Types.Mixed, // e.g. -0.3 exposure, +2 clarity
    },
    lightroomApprox: {
      type: Map,
      of: mongoose.Schema.Types.Mixed, // Lightroom tweaks to match this sim
    },
    compatibleCameras: [String], // e.g. "X-T4", "X100V"
    sampleImages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
      },
    ],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Optional for custom recipes
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    relatedPresets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Preset",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("FilmSim", filmSimSchema);
