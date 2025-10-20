const { AuthenticationError } = require("../../utils/errors");
const FilmSim = require("../../models/FilmSim");
const Tag = require("../../models/Tag");
const Image = require("../../models/Image");
const Discussion = require("../../models/Discussion");
const Preset = require("../../models/Preset");

const populateFilmSim = (query) => {
  return query
    .populate({
      path: "creator",
      select: "username avatar instagram",
    })
    .populate({
      path: "tags",
      select: "name displayName",
    })
    .populate({
      path: "sampleImages",
      select: "url caption",
    })
    .populate({
      path: "comments.user",
      select: "username avatar",
    })
    .populate({
      path: "recommendedPresets",
      select: "title slug tags afterImage",
      populate: {
        path: "afterImage",
        select: "url publicId",
      },
    });
};

const filmSimResolvers = {
  Query: {
    getFilmSim: async (_, { slug }) => {
      try {
        const filmSim = await populateFilmSim(FilmSim.findOne({ slug }));

        if (!filmSim) {
          throw new Error("Film simulation not found");
        }

        return filmSim;
      } catch (error) {
        console.error("Error in getFilmSim:", error);
        throw error;
      }
    },

    listFilmSims: async (_, { filter, page = 1, limit = 20 }) => {
      try {
        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get total count
        const totalCount = await FilmSim.countDocuments(filter || {});

        // Fetch paginated film sims
        const filmSims = await populateFilmSim(
          FilmSim.find(filter || {})
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit)
        );

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        return {
          filmSims,
          totalCount,
          hasNextPage,
          hasPreviousPage,
          currentPage: page,
          totalPages,
        };
      } catch (error) {
        console.error("Error listing film simulations:", error);
        throw new Error("Failed to list film simulations: " + error.message);
      }
    },
  },

  Mutation: {
    uploadFilmSim: async (
      _,
      { name, description, tags, settings, notes, sampleImages },
      { user }
    ) => {
      if (!user) {
        throw new AuthenticationError(
          "You must be logged in to upload a film simulation"
        );
      }

      try {
        console.log("Starting film simulation upload process...");
        console.log(
          "Received sample images:",
          JSON.stringify(sampleImages, null, 2)
        );

        const tagIds = await Promise.all(
          tags.map(async (tagName) => {
            const existingTag = await Tag.findOneAndUpdate(
              { name: tagName.toLowerCase() },
              {
                name: tagName.toLowerCase(),
                displayName: tagName,
                category: "filmsim",
              },
              { new: true, upsert: true }
            );
            return existingTag._id;
          })
        );
        console.log("Processed tags:", tagIds);

        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        const filmSimData = {
          name,
          slug,
          description,
          type: "custom-recipe",
          settings: {
            dynamicRange: settings.dynamicRange || 100,
            highlight: settings.highlight || 0,
            shadow: settings.shadow || 0,
            colour: settings.color || 0,
            sharpness: settings.sharpness || 0,
            noiseReduction: settings.noiseReduction || 0,
            grainEffect: settings.grainEffect || "OFF",
            clarity: settings.clarity || 0,
            whiteBalance: settings.whiteBalance || "auto",
            wbShift: settings.wbShift || { r: 0, b: 0 },
            filmSimulation: settings.filmSimulation || "",
            colorChromeEffect: settings.colorChromeEffect || "OFF",
            colorChromeFxBlue: settings.colorChromeFxBlue || "OFF",
          },
          notes,
          tags: tagIds,
          creator: user._id,
        };

        console.log(
          "Creating film simulation with data:",
          JSON.stringify(filmSimData, null, 2)
        );
        const filmSim = await FilmSim.create(filmSimData);
        console.log("Successfully created film simulation:", filmSim._id);

        let sampleImageIds = [];
        if (sampleImages && sampleImages.length > 0) {
          console.log("Processing sample images...");
          const images = await Promise.all(
            sampleImages.map(async (image) => {
              console.log("Creating image document for:", image.url);
              const imageDoc = await Image.create({
                url: image.url,
                publicId: image.publicId,
                uploader: user._id,
                associatedWith: {
                  kind: "FilmSim",
                  item: filmSim._id,
                },
              });
              console.log("Created image document:", imageDoc._id);
              return imageDoc._id;
            })
          );
          sampleImageIds = images.map((img) => img._id);
          console.log("Created sample image IDs:", sampleImageIds);

          filmSim.sampleImages = sampleImageIds;
          await filmSim.save();

          try {
            const discussion = new Discussion({
              title: `Discussion: ${name}`,
              linkedTo: {
                type: "filmsim",
                refId: filmSim._id,
              },
              tags: tags || [],
              createdBy: user._id,
              followers: [user._id], // Auto-subscribe creator
            });

            await discussion.save();
            console.log(
              "Discussion created successfully for film sim:",
              discussion._id
            );
          } catch (discussionError) {
            console.error(
              "Error creating discussion for film sim:",
              discussionError
            );
          }
        }

        return filmSim;
      } catch (error) {
        console.error("Error uploading film simulation:", error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
        throw new Error("Failed to upload film simulation: " + error.message);
      }
    },

    createFilmSim: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const { name, description, settings, tags, sampleImages } = input;

        const filmSim = await FilmSim.create({
          name,
          description,
          settings,
          creator: user._id,
          tags,
          sampleImages,
        });

        return filmSim;
      } catch (error) {
        console.error("Create film simulation error:", error);
        throw error;
      }
    },

    updateFilmSim: async (_, { id, input }, { user }) => {
      if (!user) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const filmSim = await FilmSim.findById(id);
        if (!filmSim) {
          throw new Error("Film simulation not found");
        }

        if (filmSim.creator.toString() !== user._id.toString()) {
          throw new AuthenticationError("Not authorized");
        }

        const updatedFilmSim = await FilmSim.findByIdAndUpdate(
          id,
          { $set: input },
          { new: true }
        );

        return updatedFilmSim;
      } catch (error) {
        console.error("Update film simulation error:", error);
        throw error;
      }
    },

    deleteFilmSim: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const filmSim = await FilmSim.findById(id);
        if (!filmSim) {
          throw new Error("Film simulation not found");
        }

        if (filmSim.creator.toString() !== user._id.toString()) {
          throw new AuthenticationError("Not authorized");
        }

        await FilmSim.findByIdAndDelete(id);
        return true;
      } catch (error) {
        console.error("Delete film simulation error:", error);
        throw error;
      }
    },

    addComment: async (_, { filmSimId, text }, { user }) => {
      if (!user) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const filmSim = await FilmSim.findById(filmSimId);
        if (!filmSim) {
          throw new Error("Film simulation not found");
        }

        const comment = {
          text,
          user: user._id,
          createdAt: new Date(),
        };

        filmSim.comments.push(comment);
        await filmSim.save();

        const populatedFilmSim = await FilmSim.findById(filmSimId).populate({
          path: "comments.user",
          select: "username avatar",
        });

        return populatedFilmSim.comments[populatedFilmSim.comments.length - 1];
      } catch (error) {
        console.error("Add comment error:", error);
        throw error;
      }
    },

    updateComment: async (_, { filmSimId, commentId, text }, { user }) => {
      if (!user) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const filmSim = await FilmSim.findById(filmSimId);
        if (!filmSim) {
          throw new Error("Film simulation not found");
        }

        const comment = filmSim.comments.id(commentId);
        if (!comment) {
          throw new Error("Comment not found");
        }

        if (comment.user.toString() !== user._id.toString()) {
          throw new AuthenticationError("Not authorized");
        }

        comment.text = text;
        comment.updatedAt = new Date();
        await filmSim.save();

        const populatedFilmSim = await FilmSim.findById(filmSimId).populate({
          path: "comments.user",
          select: "username avatar",
        });

        return populatedFilmSim.comments.id(commentId);
      } catch (error) {
        console.error("Update comment error:", error);
        throw error;
      }
    },

    deleteComment: async (_, { filmSimId, commentId }, { user }) => {
      if (!user) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const filmSim = await FilmSim.findById(filmSimId);
        if (!filmSim) {
          throw new Error("Film simulation not found");
        }

        const comment = filmSim.comments.id(commentId);
        if (!comment) {
          throw new Error("Comment not found");
        }

        if (comment.user.toString() !== user._id.toString()) {
          throw new AuthenticationError("Not authorized");
        }

        comment.remove();
        await filmSim.save();
        return true;
      } catch (error) {
        console.error("Delete comment error:", error);
        throw error;
      }
    },

    addRecommendedPreset: async (_, { filmSimId, presetId }, { user }) => {
      if (!user) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const filmSim = await FilmSim.findById(filmSimId);
        if (!filmSim) {
          throw new Error("Film simulation not found");
        }

        if (filmSim.creator.toString() !== user._id.toString()) {
          throw new AuthenticationError(
            "Not authorized to modify this film simulation"
          );
        }

        const preset = await Preset.findById(presetId);
        if (!preset) {
          throw new Error("Preset not found");
        }

        if (filmSim.recommendedPresets.includes(presetId)) {
          throw new Error("Preset is already in recommended presets");
        }

        filmSim.recommendedPresets.push(presetId);
        await filmSim.save();

        return await populateFilmSim(FilmSim.findById(filmSimId));
      } catch (error) {
        console.error("Add recommended preset error:", error);
        throw error;
      }
    },

    removeRecommendedPreset: async (_, { filmSimId, presetId }, { user }) => {
      if (!user) {
        throw new AuthenticationError("Not authenticated");
      }

      try {
        const filmSim = await FilmSim.findById(filmSimId);
        if (!filmSim) {
          throw new Error("Film simulation not found");
        }

        if (filmSim.creator.toString() !== user._id.toString()) {
          throw new AuthenticationError(
            "Not authorized to modify this film simulation"
          );
        }

        const presetIndex = filmSim.recommendedPresets.indexOf(presetId);
        if (presetIndex === -1) {
          throw new Error("Preset is not in recommended presets");
        }

        filmSim.recommendedPresets.splice(presetIndex, 1);
        await filmSim.save();

        return await populateFilmSim(FilmSim.findById(filmSimId));
      } catch (error) {
        console.error("Remove recommended preset error:", error);
        throw error;
      }
    },

    makeFilmSimFeatured: async (_, { filmSimId }, { user }) => {
      if (!user) {
        throw new AuthenticationError("You must be logged in");
      }

      if (!user.isAdmin) {
        throw new AuthenticationError(
          "Only administrators can feature film sims"
        );
      }

      try {
        // First, unfeature all other film sims
        await FilmSim.updateMany(
          { _id: { $ne: filmSimId } },
          { $set: { featured: false } }
        );

        const filmSim = await FilmSim.findById(filmSimId);
        if (!filmSim) {
          throw new UserInputError("Film sim not found");
        }

        filmSim.featured = true;
        await filmSim.save();

        return filmSim;
      } catch (error) {
        console.error("Make film sim featured error:", error);
        throw new Error("Failed to feature film sim");
      }
    },

    removeFilmSimFeatured: async (_, { filmSimId }, { user }) => {
      if (!user) {
        throw new AuthenticationError("You must be logged in");
      }

      if (!user.isAdmin) {
        throw new AuthenticationError(
          "Only administrators can remove featured status"
        );
      }

      try {
        const filmSim = await FilmSim.findById(filmSimId);
        if (!filmSim) {
          throw new UserInputError("Film sim not found");
        }

        filmSim.featured = false;
        await filmSim.save();

        return filmSim;
      } catch (error) {
        console.error("Remove film sim featured error:", error);
        throw new Error("Failed to remove featured status");
      }
    },
  },
};

module.exports = filmSimResolvers;
