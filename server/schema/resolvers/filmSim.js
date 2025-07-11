const { AuthenticationError } = require("../../utils/errors");
const FilmSim = require("../../models/FilmSim");
const Tag = require("../../models/Tag");
const Image = require("../../models/Image");
const Discussion = require("../../models/Discussion");
const Preset = require("../../models/Preset");

const filmSimResolvers = {
  Query: {
    getFilmSim: async (_, { slug }) => {
      try {
        const filmSim = await FilmSim.findOne({ slug })
          .populate({
            path: "creator",
            select: "id username avatar instagram",
          })
          .populate({
            path: "tags",
            select: "id name displayName",
          })
          .populate({
            path: "sampleImages",
            select: "id url caption",
          })
          .populate({
            path: "comments.user",
            select: "id username avatar",
          })
          .populate({
            path: "recommendedPresets",
            select: "id title slug tags afterImage",
            populate: {
              path: "afterImage",
              select: "id url publicId",
            },
          });

        if (!filmSim) {
          throw new Error("Film simulation not found");
        }

        // Convert MongoDB document to plain object
        const filmSimObj = filmSim.toObject();

        // Ensure all IDs are strings
        return {
          ...filmSimObj,
          id: filmSimObj._id ? filmSimObj._id.toString() : null,
          creator:
            filmSimObj.creator && filmSimObj.creator._id
              ? {
                  ...filmSimObj.creator,
                  id: filmSimObj.creator._id.toString(),
                }
              : null,
          tags: Array.isArray(filmSimObj.tags)
            ? filmSimObj.tags
                .filter((tag) => tag && tag._id)
                .map((tag) => ({
                  ...tag,
                  id: tag._id.toString(),
                }))
            : [],
          sampleImages: Array.isArray(filmSimObj.sampleImages)
            ? filmSimObj.sampleImages.map((image) =>
                image && image._id
                  ? { ...image, id: image._id.toString() }
                  : image
              )
            : [],
          comments: Array.isArray(filmSimObj.comments)
            ? filmSimObj.comments.map((comment) => ({
                ...comment,
                id: comment && comment._id ? comment._id.toString() : null,
                user:
                  comment && comment.user && comment.user._id
                    ? { ...comment.user, id: comment.user._id.toString() }
                    : null,
              }))
            : [],
          recommendedPresets: Array.isArray(filmSimObj.recommendedPresets)
            ? filmSimObj.recommendedPresets.map((preset) =>
                preset && preset._id
                  ? {
                      ...preset,
                      id: preset._id.toString(),
                      afterImage: preset.afterImage
                        ? {
                            ...preset.afterImage,
                            id: preset.afterImage._id.toString(),
                          }
                        : null,
                    }
                  : preset
              )
            : [],
        };
      } catch (error) {
        console.error("Error in getFilmSim:", error);
        throw error;
      }
    },

    listFilmSims: async (_, { filter }) => {
      try {
        const filmSims = await FilmSim.find(filter || {})
          .populate({
            path: "creator",
            select: "id username avatar",
          })
          .populate({
            path: "tags",
            select: "id name displayName",
          })
          .populate({
            path: "sampleImages",
            select: "id url caption",
          })
          .populate({
            path: "comments.user",
            select: "id username avatar",
          })
          .populate({
            path: "recommendedPresets",
            select: "id title slug tags afterImage",
            populate: {
              path: "afterImage",
              select: "id url publicId",
            },
          });

        // Convert MongoDB documents to plain objects and ensure all IDs are strings
        return filmSims.map((filmSim) => {
          const filmSimObj = filmSim.toObject();
          return {
            ...filmSimObj,
            id: filmSimObj._id ? filmSimObj._id.toString() : null,
            creator:
              filmSimObj.creator && filmSimObj.creator._id
                ? {
                    ...filmSimObj.creator,
                    id: filmSimObj.creator._id.toString(),
                  }
                : null,
            tags: Array.isArray(filmSimObj.tags)
              ? filmSimObj.tags
                  .filter((tag) => tag && tag._id)
                  .map((tag) => ({
                    ...tag,
                    id: tag._id.toString(),
                  }))
              : [],
            sampleImages: Array.isArray(filmSimObj.sampleImages)
              ? filmSimObj.sampleImages.map((image) =>
                  image && image._id
                    ? { ...image, id: image._id.toString() }
                    : image
                )
              : [],
            comments: Array.isArray(filmSimObj.comments)
              ? filmSimObj.comments.map((comment) => ({
                  ...comment,
                  id: comment && comment._id ? comment._id.toString() : null,
                  user:
                    comment && comment.user && comment.user._id
                      ? { ...comment.user, id: comment.user._id.toString() }
                      : null,
                }))
              : [],
            recommendedPresets: Array.isArray(filmSimObj.recommendedPresets)
              ? filmSimObj.recommendedPresets.map((preset) =>
                  preset && preset._id
                    ? {
                        ...preset,
                        id: preset._id.toString(),
                        afterImage: preset.afterImage
                          ? {
                              ...preset.afterImage,
                              id: preset.afterImage._id.toString(),
                            }
                          : null,
                      }
                    : preset
                )
              : [],
          };
        });
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

        // Create or find tags
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

        // Generate slug from name
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        // Convert dynamicRange number to string format if needed
        let dynamicRange = settings.dynamicRange;
        if (typeof dynamicRange === "number") {
          dynamicRange = `DR${dynamicRange}`;
        }

        // Create the film simulation first
        const filmSimData = {
          name,
          slug,
          description,
          type: "custom-recipe",
          settings: {
            dynamicRange: parseInt(dynamicRange.replace("DR", "")) || 100,
            highlight: parseInt(settings.highlight) || 0,
            shadow: parseInt(settings.shadow) || 0,
            colour: parseInt(settings.color) || 0,
            sharpness: parseInt(settings.sharpness) || 0,
            noiseReduction: parseInt(settings.noiseReduction) || 0,
            grainEffect: settings.grainEffect || "OFF",
            clarity: parseInt(settings.clarity) || 0,
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

        // Create sample images if provided
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

          // Update the film simulation with the sample image IDs
          filmSim.sampleImages = sampleImageIds;
          await filmSim.save();

          // Create discussion for the film sim
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
            // Don't fail the film sim creation if discussion creation fails
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

        // Create film simulation
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

        // Check if user is the creator
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

        // Check if user is the creator
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
          select: "id username avatar",
        });

        const addedComment =
          populatedFilmSim.comments[populatedFilmSim.comments.length - 1];
        return {
          ...addedComment.toObject(),
          id: addedComment._id.toString(),
          user: {
            ...addedComment.user.toObject(),
            id: addedComment.user._id.toString(),
          },
        };
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

        // Check if user is the comment author
        if (comment.user.toString() !== user._id.toString()) {
          throw new AuthenticationError("Not authorized");
        }

        comment.text = text;
        comment.updatedAt = new Date();
        await filmSim.save();

        const populatedFilmSim = await FilmSim.findById(filmSimId).populate({
          path: "comments.user",
          select: "id username avatar",
        });

        const updatedComment = populatedFilmSim.comments.id(commentId);
        return {
          ...updatedComment.toObject(),
          id: updatedComment._id.toString(),
          user: {
            ...updatedComment.user.toObject(),
            id: updatedComment.user._id.toString(),
          },
        };
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

        // Check if user is the comment author
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

        // Check if user is the creator of the film simulation
        if (filmSim.creator.toString() !== user._id.toString()) {
          throw new AuthenticationError(
            "Not authorized to modify this film simulation"
          );
        }

        // Check if preset exists
        const preset = await Preset.findById(presetId);
        if (!preset) {
          throw new Error("Preset not found");
        }

        // Check if preset already exists in recommended presets
        if (filmSim.recommendedPresets.includes(presetId)) {
          throw new Error("Preset is already in recommended presets");
        }

        // Add preset to recommended presets
        filmSim.recommendedPresets.push(presetId);
        await filmSim.save();

        // Return the updated film simulation with populated fields
        const updatedFilmSim = await FilmSim.findById(filmSimId)
          .populate({
            path: "creator",
            select: "id username avatar instagram",
          })
          .populate({
            path: "tags",
            select: "id name displayName",
          })
          .populate({
            path: "sampleImages",
            select: "id url caption",
          })
          .populate({
            path: "recommendedPresets",
            select: "id title slug tags afterImage",
          });

        return {
          ...updatedFilmSim.toObject(),
          id: updatedFilmSim._id.toString(),
          creator: updatedFilmSim.creator
            ? {
                ...updatedFilmSim.creator.toObject(),
                id: updatedFilmSim.creator._id.toString(),
              }
            : null,
          tags: updatedFilmSim.tags.map((tag) => ({
            ...tag.toObject(),
            id: tag._id.toString(),
          })),
          sampleImages: updatedFilmSim.sampleImages.map((image) => ({
            ...image.toObject(),
            id: image._id.toString(),
          })),
          recommendedPresets: updatedFilmSim.recommendedPresets.map(
            (preset) => ({
              ...preset.toObject(),
              id: preset._id.toString(),
            })
          ),
        };
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

        // Check if user is the creator of the film simulation
        if (filmSim.creator.toString() !== user._id.toString()) {
          throw new AuthenticationError(
            "Not authorized to modify this film simulation"
          );
        }

        // Check if preset exists in recommended presets
        const presetIndex = filmSim.recommendedPresets.indexOf(presetId);
        if (presetIndex === -1) {
          throw new Error("Preset is not in recommended presets");
        }

        // Remove preset from recommended presets
        filmSim.recommendedPresets.splice(presetIndex, 1);
        await filmSim.save();

        // Return the updated film simulation with populated fields
        const updatedFilmSim = await FilmSim.findById(filmSimId)
          .populate({
            path: "creator",
            select: "id username avatar instagram",
          })
          .populate({
            path: "tags",
            select: "id name displayName",
          })
          .populate({
            path: "sampleImages",
            select: "id url caption",
          })
          .populate({
            path: "recommendedPresets",
            select: "id title slug tags afterImage",
          });

        return {
          ...updatedFilmSim.toObject(),
          id: updatedFilmSim._id.toString(),
          creator: updatedFilmSim.creator
            ? {
                ...updatedFilmSim.creator.toObject(),
                id: updatedFilmSim.creator._id.toString(),
              }
            : null,
          tags: updatedFilmSim.tags.map((tag) => ({
            ...tag.toObject(),
            id: tag._id.toString(),
          })),
          sampleImages: updatedFilmSim.sampleImages.map((image) => ({
            ...image.toObject(),
            id: image._id.toString(),
          })),
          recommendedPresets: updatedFilmSim.recommendedPresets.map(
            (preset) => ({
              ...preset.toObject(),
              id: preset._id.toString(),
            })
          ),
        };
      } catch (error) {
        console.error("Remove recommended preset error:", error);
        throw error;
      }
    },
  },
};

module.exports = filmSimResolvers;
