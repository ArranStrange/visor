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

  const { colorGrading, ...settingsWithoutColorGrading } = settings;

  return {
    // Basic adjustments
    exposure: Number(settingsWithoutColorGrading.exposure) || 0,
    contrast: Number(settingsWithoutColorGrading.contrast) || 0,
    highlights: Number(settingsWithoutColorGrading.highlights) || 0,
    shadows: Number(settingsWithoutColorGrading.shadows) || 0,
    whites: Number(settingsWithoutColorGrading.whites) || 0,
    blacks: Number(settingsWithoutColorGrading.blacks) || 0,
    texture: Number(settingsWithoutColorGrading.texture) || 0,
    dehaze: Number(settingsWithoutColorGrading.dehaze) || 0,
    clarity: Number(settingsWithoutColorGrading.clarity) || 0,
    vibrance: Number(settingsWithoutColorGrading.vibrance) || 0,
    saturation: Number(settingsWithoutColorGrading.saturation) || 0,
    temp: Number(settingsWithoutColorGrading.temp) || 0,
    tint: Number(settingsWithoutColorGrading.tint) || 0,

    sharpening: Number(settingsWithoutColorGrading.sharpening) || 0,
    sharpenRadius: Number(settingsWithoutColorGrading.sharpenRadius) || 0,
    sharpenDetail: Number(settingsWithoutColorGrading.sharpenDetail) || 0,
    sharpenEdgeMasking:
      Number(settingsWithoutColorGrading.sharpenEdgeMasking) || 0,
    luminanceSmoothing:
      Number(settingsWithoutColorGrading.luminanceSmoothing) || 0,
    luminanceDetail: Number(settingsWithoutColorGrading.luminanceDetail) || 0,
    luminanceContrast:
      Number(settingsWithoutColorGrading.luminanceContrast) || 0,

    grain: settingsWithoutColorGrading.grain
      ? {
          amount: Number(settingsWithoutColorGrading.grain.amount) || 0,
          size: Number(settingsWithoutColorGrading.grain.size) || 0,
          frequency: Number(settingsWithoutColorGrading.grain.frequency) || 0,
          roughness: Number(settingsWithoutColorGrading.grain.roughness) || 0,
        }
      : undefined,
    vignette: settingsWithoutColorGrading.vignette
      ? {
          amount: Number(settingsWithoutColorGrading.vignette.amount) || 0,
          midpoint: Number(settingsWithoutColorGrading.vignette.midpoint) || 0,
          feather: Number(settingsWithoutColorGrading.vignette.feather) || 0,
          roundness:
            Number(settingsWithoutColorGrading.vignette.roundness) || 0,
          style:
            settingsWithoutColorGrading.vignette.style || "Highlight Priority",
        }
      : undefined,
    colorAdjustments: settingsWithoutColorGrading.colorAdjustments
      ? {
          ...settingsWithoutColorGrading.colorAdjustments,
          red: settingsWithoutColorGrading.colorAdjustments.red
            ? {
                hue:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.red.hue
                  ) || 0,
                saturation:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.red.saturation
                  ) || 0,
                luminance:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.red.luminance
                  ) || 0,
              }
            : undefined,
          orange: settingsWithoutColorGrading.colorAdjustments.orange
            ? {
                hue:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.orange.hue
                  ) || 0,
                saturation:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.orange
                      .saturation
                  ) || 0,
                luminance:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.orange
                      .luminance
                  ) || 0,
              }
            : undefined,
          yellow: settingsWithoutColorGrading.colorAdjustments.yellow
            ? {
                hue:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.yellow.hue
                  ) || 0,
                saturation:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.yellow
                      .saturation
                  ) || 0,
                luminance:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.yellow
                      .luminance
                  ) || 0,
              }
            : undefined,
          green: settingsWithoutColorGrading.colorAdjustments.green
            ? {
                hue:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.green.hue
                  ) || 0,
                saturation:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.green
                      .saturation
                  ) || 0,
                luminance:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.green.luminance
                  ) || 0,
              }
            : undefined,
          aqua: settingsWithoutColorGrading.colorAdjustments.aqua
            ? {
                hue:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.aqua.hue
                  ) || 0,
                saturation:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.aqua.saturation
                  ) || 0,
                luminance:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.aqua.luminance
                  ) || 0,
              }
            : undefined,
          blue: settingsWithoutColorGrading.colorAdjustments.blue
            ? {
                hue:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.blue.hue
                  ) || 0,
                saturation:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.blue.saturation
                  ) || 0,
                luminance:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.blue.luminance
                  ) || 0,
              }
            : undefined,
          purple: settingsWithoutColorGrading.colorAdjustments.purple
            ? {
                hue:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.purple.hue
                  ) || 0,
                saturation:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.purple
                      .saturation
                  ) || 0,
                luminance:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.purple
                      .luminance
                  ) || 0,
              }
            : undefined,
          magenta: settingsWithoutColorGrading.colorAdjustments.magenta
            ? {
                hue:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.magenta.hue
                  ) || 0,
                saturation:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.magenta
                      .saturation
                  ) || 0,
                luminance:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.magenta
                      .luminance
                  ) || 0,
              }
            : undefined,
        }
      : undefined,
    splitToning: settingsWithoutColorGrading.splitToning
      ? {
          shadowHue:
            Number(settingsWithoutColorGrading.splitToning.shadowHue) || 0,
          shadowSaturation:
            Number(settingsWithoutColorGrading.splitToning.shadowSaturation) ||
            0,
          highlightHue:
            Number(settingsWithoutColorGrading.splitToning.highlightHue) || 0,
          highlightSaturation:
            Number(
              settingsWithoutColorGrading.splitToning.highlightSaturation
            ) || 0,
          balance: Number(settingsWithoutColorGrading.splitToning.balance) || 0,
        }
      : undefined,
    noiseReduction: settingsWithoutColorGrading.noiseReduction
      ? {
          luminance:
            Number(settingsWithoutColorGrading.noiseReduction.luminance) || 0,
          detail:
            Number(settingsWithoutColorGrading.noiseReduction.detail) || 0,
          color: Number(settingsWithoutColorGrading.noiseReduction.color) || 0,
          colorDetail:
            Number(settingsWithoutColorGrading.noiseReduction.colorDetail) || 0,
          colorSmoothness:
            Number(
              settingsWithoutColorGrading.noiseReduction.colorSmoothness
            ) || 0,
          smoothness:
            Number(settingsWithoutColorGrading.noiseReduction.smoothness) || 0,
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

const cleanComprehensiveSettings = (data) => {
  if (!data) return {};

  return {
    cameraProfileDigest: data.cameraProfileDigest || undefined,
    profileName: data.profileName || undefined,
    lookTableName: data.lookTableName || undefined,
    version: data.version || undefined,
    processVersion: data.processVersion || undefined,
    cameraProfile: data.cameraProfile || undefined,
    whiteBalance: data.whiteBalance || undefined,

    colorGrading: data.colorGrading
      ? {
          shadowHue: Number(data.colorGrading.shadowHue) || 0,
          shadowSat: Number(data.colorGrading.shadowSat) || 0,
          shadowLuminance: Number(data.colorGrading.shadowLuminance) || 0,
          midtoneHue: Number(data.colorGrading.midtoneHue) || 0,
          midtoneSat: Number(data.colorGrading.midtoneSat) || 0,
          midtoneLuminance: Number(data.colorGrading.midtoneLuminance) || 0,
          highlightHue: Number(data.colorGrading.highlightHue) || 0,
          highlightSat: Number(data.colorGrading.highlightSat) || 0,
          highlightLuminance: Number(data.colorGrading.highlightLuminance) || 0,
          blending: Number(data.colorGrading.blending) || 0,
          balance: Number(data.colorGrading.balance) || 0,
          globalHue: Number(data.colorGrading.globalHue) || 0,
          globalSat: Number(data.colorGrading.globalSat) || 0,
          perceptual: Boolean(data.colorGrading.perceptual),
        }
      : undefined,

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

    optics: data.optics
      ? {
          removeChromaticAberration: Boolean(
            data.optics.removeChromaticAberration
          ),
          vignetteAmount: Number(data.optics.vignetteAmount) || 0,
          vignetteMidpoint: Number(data.optics.vignetteMidpoint) || 0,
        }
      : undefined,

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
          settings: cleanSettings(settings),

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
        console.log("Processed toneCurve:", presetData.toneCurve);
        const preset = await Preset.create(presetData);
        return preset;
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

        cameraProfileDigest,
        profileName,
        lookTableName,
        version,
        processVersion,
        cameraProfile,
        whiteBalance,
        colorGrading: colorGradingParam,
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

        const colorGradingFromSettings =
          settings && settings.colorGrading ? settings.colorGrading : null;
        const finalColorGrading = colorGradingFromSettings || colorGradingParam;

        const comprehensiveSettings = cleanComprehensiveSettings({
          cameraProfileDigest,
          profileName,
          lookTableName,
          version,
          processVersion,
          cameraProfile,
          whiteBalance,
          colorGrading: finalColorGrading,
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

        try {
          const discussion = new Discussion({
            title: `Discussion: ${title}`,
            linkedTo: {
              type: "preset",
              refId: preset._id,
            },
            tags: tags || [],
            createdBy: user._id,
            followers: [user._id],
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
        }

        return finalPreset;
      } catch (error) {
        console.error("Error in uploadPreset resolver:", error);
        throw new Error(`Failed to upload preset: ${error.message}`);
      }
    },

    makePresetFeatured: async (_, { presetId }, { req }) => {
      if (!req.user) {
        throw new AuthenticationError("You must be logged in");
      }

      if (!req.user.isAdmin) {
        throw new AuthenticationError("Only administrators can feature presets");
      }

      try {
        const preset = await Preset.findById(presetId);
        if (!preset) {
          throw new UserInputError("Preset not found");
        }

        preset.featured = true;
        await preset.save();

        return preset;
      } catch (error) {
        console.error("Make preset featured error:", error);
        throw new Error("Failed to feature preset");
      }
    },

    removePresetFeatured: async (_, { presetId }, { req }) => {
      if (!req.user) {
        throw new AuthenticationError("You must be logged in");
      }

      if (!req.user.isAdmin) {
        throw new AuthenticationError("Only administrators can remove featured status");
      }

      try {
        const preset = await Preset.findById(presetId);
        if (!preset) {
          throw new UserInputError("Preset not found");
        }

        preset.featured = false;
        await preset.save();

        return preset;
      } catch (error) {
        console.error("Remove preset featured error:", error);
        throw new Error("Failed to remove featured status");
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
