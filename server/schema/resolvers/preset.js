const Preset = require("../../models/Preset");
const User = require("../../models/User");
const FilmSim = require("../../models/FilmSim");
const Tag = require("../../models/Tag");
const Image = require("../../models/Image");
const Discussion = require("../../models/Discussion");
const {
  AuthenticationError,
  ValidationError,
  UserInputError,
} = require("../../utils/errors");

const formatToneCurvePoints = (arr) =>
  (arr || []).map(({ x, y }) => ({
    x: parseFloat(x) || 0,
    y: parseFloat(y) || 0,
  }));

const cleanSettings = (settings) => {
  if (!settings) return {};
  console.log("uploadPreset called");
  return {
    ...settings,
    grain: settings.grain
      ? {
          amount: Number(settings.grain.amount) || 0,
          size: Number(settings.grain.size) || 0,
          frequency: Number(settings.grain.frequency) || 0,
          roughness: Number(settings.grain.roughness) || 0,
        }
      : undefined,
    vignette: settings.vignette
      ? {
          amount: Number(settings.vignette.amount) || 0,
          midpoint: Number(settings.vignette.midpoint) || 0,
          feather: Number(settings.vignette.feather) || 0,
          roundness: Number(settings.vignette.roundness) || 0,
          style: settings.vignette.style || "Highlight Priority",
        }
      : undefined,
    colorAdjustments: settings.colorAdjustments
      ? {
          ...settings.colorAdjustments,
          red: settings.colorAdjustments.red
            ? {
                hue: Number(settings.colorAdjustments.red.hue) || 0,
                saturation:
                  Number(settings.colorAdjustments.red.saturation) || 0,
                luminance: Number(settings.colorAdjustments.red.luminance) || 0,
              }
            : undefined,
          orange: settings.colorAdjustments.orange
            ? {
                hue: Number(settings.colorAdjustments.orange.hue) || 0,
                saturation:
                  Number(settings.colorAdjustments.orange.saturation) || 0,
                luminance:
                  Number(settings.colorAdjustments.orange.luminance) || 0,
              }
            : undefined,
          yellow: settings.colorAdjustments.yellow
            ? {
                hue: Number(settings.colorAdjustments.yellow.hue) || 0,
                saturation:
                  Number(settings.colorAdjustments.yellow.saturation) || 0,
                luminance:
                  Number(settings.colorAdjustments.yellow.luminance) || 0,
              }
            : undefined,
          green: settings.colorAdjustments.green
            ? {
                hue: Number(settings.colorAdjustments.green.hue) || 0,
                saturation:
                  Number(settings.colorAdjustments.green.saturation) || 0,
                luminance:
                  Number(settings.colorAdjustments.green.luminance) || 0,
              }
            : undefined,
          aqua: settings.colorAdjustments.aqua
            ? {
                hue: Number(settings.colorAdjustments.aqua.hue) || 0,
                saturation:
                  Number(settings.colorAdjustments.aqua.saturation) || 0,
                luminance:
                  Number(settings.colorAdjustments.aqua.luminance) || 0,
              }
            : undefined,
          blue: settings.colorAdjustments.blue
            ? {
                hue: Number(settings.colorAdjustments.blue.hue) || 0,
                saturation:
                  Number(settings.colorAdjustments.blue.saturation) || 0,
                luminance:
                  Number(settings.colorAdjustments.blue.luminance) || 0,
              }
            : undefined,
          purple: settings.colorAdjustments.purple
            ? {
                hue: Number(settings.colorAdjustments.purple.hue) || 0,
                saturation:
                  Number(settings.colorAdjustments.purple.saturation) || 0,
                luminance:
                  Number(settings.colorAdjustments.purple.luminance) || 0,
              }
            : undefined,
          magenta: settings.colorAdjustments.magenta
            ? {
                hue: Number(settings.colorAdjustments.magenta.hue) || 0,
                saturation:
                  Number(settings.colorAdjustments.magenta.saturation) || 0,
                luminance:
                  Number(settings.colorAdjustments.magenta.luminance) || 0,
              }
            : undefined,
        }
      : undefined,
    splitToning: settings.splitToning
      ? {
          shadowHue: Number(settings.splitToning.shadowHue) || 0,
          shadowSaturation: Number(settings.splitToning.shadowSaturation) || 0,
          highlightHue: Number(settings.splitToning.highlightHue) || 0,
          highlightSaturation:
            Number(settings.splitToning.highlightSaturation) || 0,
          balance: Number(settings.splitToning.balance) || 0,
        }
      : undefined,
    noiseReduction: settings.noiseReduction
      ? {
          luminance: Number(settings.noiseReduction.luminance) || 0,
          detail: Number(settings.noiseReduction.detail) || 0,
          color: Number(settings.noiseReduction.color) || 0,
          colorDetail: Number(settings.noiseReduction.colorDetail) || 0,
          colorSmoothness: Number(settings.noiseReduction.colorSmoothness) || 0,
        }
      : undefined,
  };
};

const cleanToneCurve = (toneCurve) => {
  if (!toneCurve) return undefined;
  const cleanPoints = (arr) =>
    Array.isArray(arr)
      ? arr.map(({ x, y }) => ({
          x: Number(x) || 0,
          y: Number(y) || 0,
        }))
      : [];
  return {
    rgb: cleanPoints(toneCurve.rgb),
    red: cleanPoints(toneCurve.red),
    green: cleanPoints(toneCurve.green),
    blue: cleanPoints(toneCurve.blue),
  };
};

// Helper function to clean comprehensive settings
const cleanComprehensiveSettings = (data) => {
  if (!data) return {};

  return {
    // Camera & Profile Metadata
    cameraProfileDigest: data.cameraProfileDigest || undefined,
    profileName: data.profileName || undefined,
    lookTableName: data.lookTableName || undefined,

    // Color Grading
    colorGrading: data.colorGrading
      ? {
          shadowHue: Number(data.colorGrading.shadowHue) || 0,
          shadowSat: Number(data.colorGrading.shadowSat) || 0,
          midtoneHue: Number(data.colorGrading.midtoneHue) || 0,
          midtoneSat: Number(data.colorGrading.midtoneSat) || 0,
          highlightHue: Number(data.colorGrading.highlightHue) || 0,
          highlightSat: Number(data.colorGrading.highlightSat) || 0,
          blending: Number(data.colorGrading.blending) || 0,
          globalHue: Number(data.colorGrading.globalHue) || 0,
          globalSat: Number(data.colorGrading.globalSat) || 0,
          perceptual: Boolean(data.colorGrading.perceptual),
        }
      : undefined,

    // Lens Corrections
    lensCorrections: data.lensCorrections
      ? {
          enableLensProfileCorrections: Boolean(
            data.lensCorrections.enableLensProfileCorrections
          ),
          lensProfileName: data.lensCorrections.lensProfileName || undefined,
          lensManualDistortionAmount:
            Number(data.lensCorrections.lensManualDistortionAmount) || 0,
          perspectiveUpright: data.lensCorrections.perspectiveUpright || "Off",
          autoLateralCA: Boolean(data.lensCorrections.autoLateralCA),
        }
      : undefined,

    // Optics
    optics: data.optics
      ? {
          removeChromaticAberration: Boolean(
            data.optics.removeChromaticAberration
          ),
          vignetteAmount: Number(data.optics.vignetteAmount) || 0,
          vignetteMidpoint: Number(data.optics.vignetteMidpoint) || 0,
        }
      : undefined,

    // Transform
    transform: data.transform
      ? {
          perspectiveVertical: Number(data.transform.perspectiveVertical) || 0,
          perspectiveHorizontal:
            Number(data.transform.perspectiveHorizontal) || 0,
          perspectiveRotate: Number(data.transform.perspectiveRotate) || 0,
          perspectiveScale: Number(data.transform.perspectiveScale) || 0,
          perspectiveAspect: Number(data.transform.perspectiveAspect) || 0,
          autoPerspective: Boolean(data.transform.autoPerspective),
        }
      : undefined,

    // Effects
    effects: data.effects
      ? {
          postCropVignetteAmount:
            Number(data.effects.postCropVignetteAmount) || 0,
          postCropVignetteMidpoint:
            Number(data.effects.postCropVignetteMidpoint) || 0,
          postCropVignetteFeather:
            Number(data.effects.postCropVignetteFeather) || 0,
          postCropVignetteRoundness:
            Number(data.effects.postCropVignetteRoundness) || 0,
          postCropVignetteStyle:
            data.effects.postCropVignetteStyle || "Highlight Priority",
          grainAmount: Number(data.effects.grainAmount) || 0,
          grainSize: Number(data.effects.grainSize) || 0,
          grainFrequency: Number(data.effects.grainFrequency) || 0,
        }
      : undefined,

    // Calibration
    calibration: data.calibration
      ? {
          cameraCalibrationBluePrimaryHue:
            Number(data.calibration.cameraCalibrationBluePrimaryHue) || 0,
          cameraCalibrationBluePrimarySaturation:
            Number(data.calibration.cameraCalibrationBluePrimarySaturation) ||
            0,
          cameraCalibrationGreenPrimaryHue:
            Number(data.calibration.cameraCalibrationGreenPrimaryHue) || 0,
          cameraCalibrationGreenPrimarySaturation:
            Number(data.calibration.cameraCalibrationGreenPrimarySaturation) ||
            0,
          cameraCalibrationRedPrimaryHue:
            Number(data.calibration.cameraCalibrationRedPrimaryHue) || 0,
          cameraCalibrationRedPrimarySaturation:
            Number(data.calibration.cameraCalibrationRedPrimarySaturation) || 0,
          cameraCalibrationShadowTint:
            Number(data.calibration.cameraCalibrationShadowTint) || 0,
          cameraCalibrationVersion:
            data.calibration.cameraCalibrationVersion || undefined,
        }
      : undefined,

    // Crop & Orientation
    crop: data.crop
      ? {
          cropTop: Number(data.crop.cropTop) || 0,
          cropLeft: Number(data.crop.cropLeft) || 0,
          cropBottom: Number(data.crop.cropBottom) || 0,
          cropRight: Number(data.crop.cropRight) || 0,
          cropAngle: Number(data.crop.cropAngle) || 0,
          cropConstrainToWarp: Boolean(data.crop.cropConstrainToWarp),
        }
      : undefined,
    orientation: data.orientation || "0",

    // Metadata
    metadata: data.metadata
      ? {
          rating: Number(data.metadata.rating) || 0,
          label: data.metadata.label || undefined,
          title: data.metadata.title || undefined,
          creator: data.metadata.creator || undefined,
          dateCreated: data.metadata.dateCreated
            ? new Date(data.metadata.dateCreated)
            : undefined,
        }
      : undefined,

    // Other
    hasSettings: Boolean(data.hasSettings),
    rawFileName: data.rawFileName || undefined,
    snapshot: data.snapshot || undefined,
  };
};

const presetResolvers = {
  Query: {
    getPreset: async (_, { slug }) => {
      try {
        const preset = await Preset.findOne({ slug })
          .populate({ path: "creator", select: "id username avatar instagram" })
          .populate({ path: "tags", select: "id name displayName" })
          .populate({ path: "beforeImage", select: "id url publicId" })
          .populate({ path: "afterImage", select: "id url publicId" })
          .populate({ path: "sampleImages", select: "id url caption" });
        if (!preset) throw new Error("Preset not found");
        const presetObj = preset.toObject();
        return {
          ...presetObj,
          id: presetObj._id.toString(),
          creator: {
            ...presetObj.creator,
            id: presetObj.creator._id.toString(),
          },
          tags: presetObj.tags.map((tag) => ({
            ...tag,
            id: tag._id.toString(),
          })),
          beforeImage: presetObj.beforeImage
            ? {
                ...presetObj.beforeImage,
                id: presetObj.beforeImage._id.toString(),
              }
            : null,
          afterImage: presetObj.afterImage
            ? {
                ...presetObj.afterImage,
                id: presetObj.afterImage._id.toString(),
              }
            : null,
          sampleImages: presetObj.sampleImages.map((image) => ({
            ...image,
            id: image._id.toString(),
          })),
        };
      } catch (error) {
        console.error("Error in getPreset:", error);
        throw error;
      }
    },
    getPresetById: async (_, { id }) => await Preset.findById(id),
    listPresets: async (_, { filter }) => {
      try {
        const presets = await Preset.find(filter || {})
          .populate({ path: "creator", select: "id username avatar" })
          .populate({ path: "tags", select: "id name displayName" })
          .populate({ path: "filmSim", select: "id name slug" })
          .populate({ path: "afterImage", select: "id url publicId" })
          .populate({ path: "sampleImages", select: "id url caption" });
        return presets.filter(
          (preset) => preset.afterImage && preset.afterImage.url
        );
      } catch (error) {
        console.error("Error listing presets:", error);
        throw new Error("Failed to list presets: " + error.message);
      }
    },
  },
  Mutation: {
    createPreset: async (_, { input }, { user }) => {
      try {
        if (!user) throw new Error("Authentication required");
        if (!input.title) throw new Error("Title is required");
        if (!input.slug) throw new Error("Slug is required");
        if (!input.xmpUrl) throw new Error("XMP URL is required");
        const existingPreset = await Preset.findOne({ slug: input.slug });
        if (existingPreset)
          throw new Error("A preset with this slug already exists");
        const settings = input.settings || {};
        const presetData = {
          ...input,
          creator: user.id,
          settings: {
            exposure: parseFloat(settings.exposure) || 0,
            contrast: parseFloat(settings.contrast) || 0,
            highlights: parseFloat(settings.highlights) || 0,
            shadows: parseFloat(settings.shadows) || 0,
            whites: parseFloat(settings.whites) || 0,
            blacks: parseFloat(settings.blacks) || 0,
            temp: parseFloat(settings.temp) || 0,
            tint: parseFloat(settings.tint) || 0,
            vibrance: parseFloat(settings.vibrance) || 0,
            saturation: parseFloat(settings.saturation) || 0,
            clarity: parseFloat(settings.clarity) || 0,
            dehaze: parseFloat(settings.dehaze) || 0,
            grain: settings.grain
              ? {
                  amount: parseFloat(settings.grain.amount) || 0,
                  size: parseFloat(settings.grain.size) || 0,
                  roughness: parseFloat(settings.grain.roughness) || 0,
                }
              : { amount: 0, size: 0, roughness: 0 },
            sharpening: parseFloat(settings.sharpening) || 0,
            noiseReduction: settings.noiseReduction
              ? {
                  luminance: parseFloat(settings.noiseReduction.luminance) || 0,
                  detail: parseFloat(settings.noiseReduction.detail) || 0,
                  color: parseFloat(settings.noiseReduction.color) || 0,
                }
              : { luminance: 0, detail: 0, color: 0 },
          },

          toneCurve: input.toneCurve
            ? {
                rgb: formatToneCurvePoints(input.toneCurve.rgb),
                red: formatToneCurvePoints(input.toneCurve.red),
                green: formatToneCurvePoints(input.toneCurve.green),
                blue: formatToneCurvePoints(input.toneCurve.blue),
              }
            : undefined,
        };
        console.log("Received toneCurve input:", input.toneCurve);
        console.log("Processed toneCurve:", toneCurve);
        const preset = await Preset.create(presetData);
        return preset;
        // Note: uploadPreset is the preferred mutation for file uploads and full preset creation from the frontend.
      } catch (error) {
        console.error("Error creating preset:", error);
        throw error;
      }
    },
    updatePreset: async (_, { id, input }) =>
      await Preset.findByIdAndUpdate(id, input, { new: true }),
    deletePreset: async (_, { id }) => !!(await Preset.findByIdAndDelete(id)),
    likePreset: async (_, { presetId }, { user }) => {
      const preset = await Preset.findById(presetId);
      if (!preset.likes.includes(user.id)) {
        preset.likes.push(user.id);
        await preset.save();
      }
      return true;
    },
    downloadPreset: async (_, { presetId }) => {
      const preset = await Preset.findById(presetId);
      preset.downloads += 1;
      await preset.save();
      return true;
    },
    uploadPreset: async (
      _,
      {
        title,
        description,
        settings,
        toneCurve,
        notes,
        tags,
        beforeImage,
        afterImage,
        sampleImages,
        // New comprehensive settings
        cameraProfileDigest,
        profileName,
        lookTableName,
        colorGrading,
        lensCorrections,
        optics,
        transform,
        effects,
        calibration,
        crop,
        orientation,
        metadata,
        hasSettings,
        rawFileName,
        snapshot,
      },
      { user }
    ) => {
      console.log("Starting preset upload with user:", user?._id);

      if (!user) {
        console.error("No user found in context");
        throw new Error("You must be logged in to upload a preset");
      }

      try {
        console.log("Creating tags for:", tags);
        const tagDocuments = await Promise.all(
          tags.map(async (tagName) => {
            try {
              const tag = await Tag.findOneAndUpdate(
                { name: tagName.toLowerCase() },
                {
                  name: tagName.toLowerCase(),
                  displayName: tagName,
                },
                { upsert: true, new: true }
              );
              return tag._id;
            } catch (error) {
              console.error("Error creating tag:", tagName, error);
              throw error;
            }
          })
        );
        console.log("Tags created successfully:", tagDocuments);

        const baseSlug = title.toLowerCase().replace(/\s+/g, "-");
        let slug = baseSlug;
        while (await Preset.findOne({ slug })) {
          slug = `${baseSlug}-${Date.now()}`;
        }
        console.log("Generated slug:", slug);

        console.log(
          "Creating preset with settings:",
          JSON.stringify(settings, null, 2)
        );

        // Clean comprehensive settings
        const comprehensiveSettings = cleanComprehensiveSettings({
          cameraProfileDigest,
          profileName,
          lookTableName,
          colorGrading,
          lensCorrections,
          optics,
          transform,
          effects,
          calibration,
          crop,
          orientation,
          metadata,
          hasSettings,
          rawFileName,
          snapshot,
        });

        const preset = new Preset({
          title,
          description,
          settings: cleanSettings(settings),
          toneCurve: cleanToneCurve(toneCurve),
          notes,
          tags: tagDocuments,
          creator: user._id,
          slug,
          ...comprehensiveSettings,
        });

        console.log("Saving preset...");
        await preset.save();
        console.log("Preset saved successfully:", preset._id);

        if (beforeImage) {
          console.log("Creating before image document...");
          try {
            const beforeImageDoc = new Image({
              url: beforeImage.url,
              publicId: beforeImage.publicId,
              uploader: user._id,
              isBeforeImage: true,
              associatedWith: { kind: "Preset", item: preset._id },
              submittedAt: new Date(),
            });
            await beforeImageDoc.save();
            preset.beforeImage = beforeImageDoc._id;
            console.log("Before image saved successfully:", beforeImageDoc._id);
          } catch (error) {
            console.error("Error saving before image:", error);
            throw error;
          }
        }

        if (afterImage) {
          console.log("Creating after image document...");
          try {
            const afterImageDoc = new Image({
              url: afterImage.url,
              publicId: afterImage.publicId,
              uploader: user._id,
              isAfterImage: true,
              associatedWith: { kind: "Preset", item: preset._id },
              submittedAt: new Date(),
            });
            await afterImageDoc.save();
            preset.afterImage = afterImageDoc._id;
            console.log("After image saved successfully:", afterImageDoc._id);
          } catch (error) {
            console.error("Error saving after image:", error);
            throw error;
          }
        }

        // Save sample images if provided
        if (sampleImages && sampleImages.length > 0) {
          console.log("Creating sample image documents...");
          try {
            const sampleImageDocs = await Promise.all(
              sampleImages.map(async (image) => {
                const imageDoc = new Image({
                  url: image.url,
                  publicId: image.publicId,
                  uploader: user._id,
                  associatedWith: { kind: "Preset", item: preset._id },
                  submittedAt: new Date(),
                });
                await imageDoc.save();
                return imageDoc._id;
              })
            );
            preset.sampleImages = sampleImageDocs;
            console.log("Sample images saved successfully:", sampleImageDocs);
          } catch (error) {
            console.error("Error saving sample images:", error);
            throw error;
          }
        }

        console.log("Saving preset with image references...");
        await preset.save();
        console.log("Preset saved with image references");

        console.log("Fetching final preset with populated fields...");

        console.log("Preset ID:", preset._id);

        const finalPreset = await Preset.findById(preset._id)
          .populate("creator")
          .populate("tags")
          .populate("beforeImage")
          .populate("afterImage")
          .populate("sampleImages");

        console.log("Final preset:", finalPreset);
        if (!finalPreset) {
          throw new Error("Preset not found after save");
        }

        console.log("Preset upload completed successfully");

        // Create discussion for the preset
        try {
          const discussion = new Discussion({
            title: `Discussion: ${title}`,
            linkedTo: {
              type: "preset",
              refId: preset._id,
            },
            tags: tags || [],
            createdBy: user._id,
            followers: [user._id], // Auto-subscribe creator
          });

          await discussion.save();
          console.log(
            "Discussion created successfully for preset:",
            discussion._id
          );
        } catch (discussionError) {
          console.error(
            "Error creating discussion for preset:",
            discussionError
          );
          // Don't fail the preset creation if discussion creation fails
        }

        return finalPreset;
      } catch (error) {
        console.error("Error in uploadPreset resolver:", error);
        throw new Error(`Failed to upload preset: ${error.message}`);
      }
    },
  },
  Preset: {
    creator: async (preset) => await User.findById(preset.creator),
    tags: async (preset) => await Tag.find({ _id: { $in: preset.tags } }),
    filmSim: async (preset) => await FilmSim.findById(preset.filmSim),
    sampleImages: async (preset) =>
      await Image.find({ _id: { $in: preset.sampleImages } }),
  },
};

module.exports = presetResolvers;
