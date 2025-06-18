const Preset = require("../../models/Preset");
const User = require("../../models/User");
const FilmSim = require("../../models/FilmSim");
const Tag = require("../../models/Tag");
const Image = require("../../models/Image");
const {
  AuthenticationError,
  ValidationError,
  UserInputError,
} = require("../../utils/errors");

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
                rgb: (input.toneCurve.rgb || []).map((v) => parseFloat(v) || 0),
                red: (input.toneCurve.red || []).map((v) => parseFloat(v) || 0),
                green: (input.toneCurve.green || []).map(
                  (v) => parseFloat(v) || 0
                ),
                blue: (input.toneCurve.blue || []).map(
                  (v) => parseFloat(v) || 0
                ),
              }
            : undefined,
        };
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
                { name: tagName.toLowerCase() },
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
        const preset = new Preset({
          title,
          description,
          settings,
          toneCurve,
          notes,
          tags: tagDocuments,
          creator: user._id,
          slug,
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
        const finalPreset = await Preset.findById(preset._id)
          .populate("creator")
          .populate("tags")
          .populate("beforeImage")
          .populate("afterImage")
          .populate("sampleImages");

        if (!finalPreset) {
          console.error("Failed to find preset after creation");
          throw new Error("Failed to create preset");
        }

        console.log("Preset upload completed successfully");
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
