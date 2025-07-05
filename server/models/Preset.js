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

    beforeImage: {
      type: Schema.Types.ObjectId,
      ref: "Image",
    },

    afterImage: {
      type: Schema.Types.ObjectId,
      ref: "Image",
    },

    // Camera & Profile Metadata
    cameraProfileDigest: String,
    profileName: String,
    lookTableName: String,
    version: String,
    processVersion: String,
    cameraProfile: String,
    whiteBalance: String,

    settings: {
      // Light settings
      exposure: { type: Number, default: 0 },
      contrast: { type: Number, default: 0 },
      highlights: { type: Number, default: 0 },
      shadows: { type: Number, default: 0 },
      whites: { type: Number, default: 0 },
      blacks: { type: Number, default: 0 },
      texture: { type: Number, default: 0 },
      dehaze: { type: Number, default: 0 },

      // Color settings
      temp: { type: Number, default: 0 },
      tint: { type: Number, default: 0 },
      vibrance: { type: Number, default: 0 },
      saturation: { type: Number, default: 0 },

      // Effects
      clarity: { type: Number, default: 0 },
      grain: {
        amount: { type: Number, default: 0 },
        size: { type: Number, default: 0 },
        roughness: { type: Number, default: 0 },
        frequency: { type: Number, default: 0 },
      },

      vignette: {
        amount: { type: Number, default: 0 },
        midpoint: { type: Number, default: 0 },
        feather: { type: Number, default: 0 },
        roundness: { type: Number, default: 0 },
        style: { type: String, default: "Highlight Priority" },
      },

      colorAdjustments: {
        red: {
          hue: { type: Number, default: 0 },
          saturation: { type: Number, default: 0 },
          luminance: { type: Number, default: 0 },
        },
        orange: {
          hue: { type: Number, default: 0 },
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
          luminance: { type: Number, default: 0 },
        },
        aqua: {
          hue: { type: Number, default: 0 },
          saturation: { type: Number, default: 0 },
          luminance: { type: Number, default: 0 },
        },
        blue: {
          hue: { type: Number, default: 0 },
          saturation: { type: Number, default: 0 },
          luminance: { type: Number, default: 0 },
        },
        purple: {
          hue: { type: Number, default: 0 },
          saturation: { type: Number, default: 0 },
          luminance: { type: Number, default: 0 },
        },
        magenta: {
          hue: { type: Number, default: 0 },
          saturation: { type: Number, default: 0 },
          luminance: { type: Number, default: 0 },
        },
      },

      // Legacy Split Toning
      splitToning: {
        shadowHue: { type: Number, default: 0 },
        shadowSaturation: { type: Number, default: 0 },
        highlightHue: { type: Number, default: 0 },
        highlightSaturation: { type: Number, default: 0 },
        balance: { type: Number, default: 0 },
      },

      // Detail (Sharpening & Noise)
      sharpening: { type: Number, default: 0 },
      sharpenRadius: { type: Number, default: 0 },
      sharpenDetail: { type: Number, default: 0 },
      sharpenEdgeMasking: { type: Number, default: 0 },
      luminanceSmoothing: { type: Number, default: 0 },
      luminanceDetail: { type: Number, default: 0 },
      luminanceContrast: { type: Number, default: 0 },
      noiseReduction: {
        luminance: { type: Number, default: 0 },
        detail: { type: Number, default: 0 },
        color: { type: Number, default: 0 },
        colorDetail: { type: Number, default: 0 },
        colorSmoothness: { type: Number, default: 0 },
        smoothness: { type: Number, default: 0 },
      },
    },

    // Color Grading (new format)
    colorGrading: {
      shadowHue: { type: Number, default: 0 },
      shadowSat: { type: Number, default: 0 },
      shadowLuminance: { type: Number, default: 0 },
      midtoneHue: { type: Number, default: 0 },
      midtoneSat: { type: Number, default: 0 },
      midtoneLuminance: { type: Number, default: 0 },
      highlightHue: { type: Number, default: 0 },
      highlightSat: { type: Number, default: 0 },
      highlightLuminance: { type: Number, default: 0 },
      blending: { type: Number, default: 0 },
      balance: { type: Number, default: 0 },
      globalHue: { type: Number, default: 0 },
      globalSat: { type: Number, default: 0 },
      perceptual: { type: Boolean, default: false },
    },

    // Lens Corrections
    lensCorrections: {
      enableLensProfileCorrections: { type: Boolean, default: false },
      lensProfileName: String,
      lensManualDistortionAmount: { type: Number, default: 0 },
      perspectiveUpright: { type: String, default: "Off" },
      autoLateralCA: { type: Boolean, default: false },
    },

    // Optics
    optics: {
      removeChromaticAberration: { type: Boolean, default: false },
      vignetteAmount: { type: Number, default: 0 },
      vignetteMidpoint: { type: Number, default: 0 },
    },

    // Transform (Geometry)
    transform: {
      perspectiveVertical: { type: Number, default: 0 },
      perspectiveHorizontal: { type: Number, default: 0 },
      perspectiveRotate: { type: Number, default: 0 },
      perspectiveScale: { type: Number, default: 0 },
      perspectiveAspect: { type: Number, default: 0 },
      autoPerspective: { type: Boolean, default: false },
    },

    // Effects (Post-crop)
    effects: {
      postCropVignetteAmount: { type: Number, default: 0 },
      postCropVignetteMidpoint: { type: Number, default: 0 },
      postCropVignetteFeather: { type: Number, default: 0 },
      postCropVignetteRoundness: { type: Number, default: 0 },
      postCropVignetteStyle: { type: String, default: "Highlight Priority" },
      grainAmount: { type: Number, default: 0 },
      grainSize: { type: Number, default: 0 },
      grainFrequency: { type: Number, default: 0 },
    },

    // Calibration
    calibration: {
      cameraCalibrationBluePrimaryHue: { type: Number, default: 0 },
      cameraCalibrationBluePrimarySaturation: { type: Number, default: 0 },
      cameraCalibrationGreenPrimaryHue: { type: Number, default: 0 },
      cameraCalibrationGreenPrimarySaturation: { type: Number, default: 0 },
      cameraCalibrationRedPrimaryHue: { type: Number, default: 0 },
      cameraCalibrationRedPrimarySaturation: { type: Number, default: 0 },
      cameraCalibrationShadowTint: { type: Number, default: 0 },
      cameraCalibrationVersion: String,
    },

    // Crop & Orientation
    crop: {
      cropTop: { type: Number, default: 0 },
      cropLeft: { type: Number, default: 0 },
      cropBottom: { type: Number, default: 0 },
      cropRight: { type: Number, default: 0 },
      cropAngle: { type: Number, default: 0 },
      cropConstrainToWarp: { type: Boolean, default: false },
    },
    orientation: { type: String, default: "0" },

    // Metadata
    metadata: {
      rating: { type: Number, default: 0 },
      label: String,
      title: String,
      creator: String,
      dateCreated: Date,
    },

    // Other
    hasSettings: { type: Boolean, default: false },
    rawFileName: String,
    snapshot: String,

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
