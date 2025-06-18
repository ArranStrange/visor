const mongoose = require("mongoose");
const { Schema } = mongoose;

const filmSimSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },

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
      rgb: [
        {
          x: Number,
          y: Number,
        },
      ],
      red: [
        {
          x: Number,
          y: Number,
        },
      ],
      green: [
        {
          x: Number,
          y: Number,
        },
      ],
      blue: [
        {
          x: Number,
          y: Number,
        },
      ],
    },

    tags: [String],

    sampleImages: [{ type: Schema.Types.ObjectId, ref: "Image" }],

    thumbnail: String, // URL to the thumbnail image

    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    recommendedPresets: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Preset" },
    ],

    compatibleCameras: [String], // e.g., ["X100V", "X-T4"], could also ref Camera model later

    notes: String,

    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],

    likes: {
      type: Number,
      default: 0,
    },

    downloads: {
      type: Number,
      default: 0,
    },

    isPublic: {
      type: Boolean,
      default: true,
    },

    // Basic Settings
    version: String,
    processVersion: String,
    cameraProfile: String,
    toneCurveName: String,

    // Exposure and Tone
    exposure: Number,
    contrast: Number,
    highlights: Number,
    shadows: Number,
    whites: Number,
    blacks: Number,
    texture: Number,
    dehaze: Number,

    // Grain Settings
    grain: {
      amount: Number,
      size: Number,
      frequency: Number,
    },

    // Vignette
    vignette: {
      amount: Number,
    },

    // Color Adjustments
    colorAdjustments: {
      red: {
        hue: Number,
        saturation: Number,
        luminance: Number,
      },
      orange: {
        saturation: Number,
        luminance: Number,
      },
      yellow: {
        hue: Number,
        saturation: Number,
        luminance: Number,
      },
      green: {
        hue: Number,
        saturation: Number,
      },
      blue: {
        hue: Number,
        saturation: Number,
      },
    },

    // Split Toning
    splitToning: {
      shadowHue: Number,
      shadowSaturation: Number,
      highlightHue: Number,
      highlightSaturation: Number,
      balance: Number,
    },
  },
  { timestamps: true }
);

// Add text index for search functionality
filmSimSchema.index({ name: "text", description: "text", tags: "text" });

module.exports = mongoose.model("FilmSim", filmSimSchema);
