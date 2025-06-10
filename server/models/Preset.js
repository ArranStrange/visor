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
    },

    settings: {
      // Light settings
      exposure: { type: Number, default: 0 },
      contrast: { type: Number, default: 0 },
      highlights: { type: Number, default: 0 },
      shadows: { type: Number, default: 0 },
      whites: { type: Number, default: 0 },
      blacks: { type: Number, default: 0 },

      // Color settings
      temp: { type: Number, default: 0 },
      tint: { type: Number, default: 0 },
      vibrance: { type: Number, default: 0 },
      saturation: { type: Number, default: 0 },

      // Effects
      clarity: { type: Number, default: 0 },
      dehaze: { type: Number, default: 0 },
      grain: {
        amount: { type: Number, default: 0 },
        size: { type: Number, default: 0 },
        roughness: { type: Number, default: 0 },
      },

      vignette: {
        amount: { type: Number, default: 0 },
      },

      colorAdjustments: {
        red: {
          hue: { type: Number, default: 0 },
          saturation: { type: Number, default: 0 },
          luminance: { type: Number, default: 0 },
        },
        orange: {
          saturation: { type: Number, default: 0 },
          luminance: { type: Number, default: 0 },
        },
        yellow: {
          hue: { type: Number, default: 0 },
          saturation: { type: Number, default: 0 },
          luminance: { type: Number, default: 0 },
        },
        green: {
          hue: { type: Number, default: 0 },
          saturation: { type: Number, default: 0 },
        },
        blue: {
          hue: { type: Number, default: 0 },
          saturation: { type: Number, default: 0 },
        },
      },

      splitToning: {
        shadowHue: { type: Number, default: 0 },
        shadowSaturation: { type: Number, default: 0 },
        highlightHue: { type: Number, default: 0 },
        highlightSaturation: { type: Number, default: 0 },
        balance: { type: Number, default: 0 },
      },

      // Detail
      sharpening: { type: Number, default: 0 },
      noiseReduction: {
        luminance: { type: Number, default: 0 },
        detail: { type: Number, default: 0 },
        color: { type: Number, default: 0 },
      },
    },

    toneCurve: {
      rgb: [
        {
          x: { type: Number, required: true },
          y: { type: Number, required: true },
        },
      ],
      red: [
        {
          x: { type: Number, required: true },
          y: { type: Number, required: true },
        },
      ],
      green: [
        {
          x: { type: Number, required: true },
          y: { type: Number, required: true },
        },
      ],
      blue: [
        {
          x: { type: Number, required: true },
          y: { type: Number, required: true },
        },
      ],
    },

    notes: String, // Creator's notes

    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],

    sampleImages: [{ type: Schema.Types.ObjectId, ref: "Image" }],

    thumbnail: String, // URL to the thumbnail image

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
