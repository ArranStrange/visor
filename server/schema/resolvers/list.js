const { AuthenticationError } = require("../../utils/errors");
const UserList = require("../../models/UserList");
const Preset = require("../../models/Preset");
const FilmSim = require("../../models/FilmSim");
const Tag = require("../../models/Tag");

module.exports = {
  Query: {
    featuredUserLists: async () => {
      try {
        const lists = await UserList.find({ isPublic: true, isFeatured: true })
          .sort({ updatedAt: -1 })
          .limit(10)
          .populate("owner", "id username avatar")
          .populate({
            path: "presets",
            select: "id title slug afterImage",
            populate: [{ path: "afterImage", select: "id url" }],
          })
          .populate({
            path: "filmSims",
            select: "id name slug sampleImages",
            populate: { path: "sampleImages", select: "id url" },
          });

        return lists.map((list) => {
          const listObj = list.toObject();
          return {
            ...listObj,
            id: listObj._id.toString(),
            owner: {
              id: listObj.owner._id.toString(),
              username: listObj.owner.username,
              avatar: listObj.owner.avatar,
            },
            presets:
              listObj.presets?.map((preset) => ({
                ...preset,
                id: preset._id.toString(),
                afterImage:
                  preset.afterImage && preset.afterImage._id
                    ? {
                        id: preset.afterImage._id.toString(),
                        url: preset.afterImage.url,
                      }
                    : null,
              })) || [],
            filmSims:
              listObj.filmSims?.map((filmSim) => ({
                ...filmSim,
                id: filmSim._id.toString(),
                sampleImages:
                  filmSim.sampleImages?.map((img) => ({
                    id: img._id.toString(),
                    url: img.url,
                  })) || [],
              })) || [],
          };
        });
      } catch (e) {
        console.error("Error fetching featured lists:", e);
        throw new Error("Failed to fetch featured lists");
      }
    },
    browseUserLists: async (_, { search = "", page = 1, limit = 20 }) => {
      try {
        const skip = (page - 1) * limit;

        // Build base query for public lists only
        let query = { isPublic: true };

        // If there's a search term, we need to search across multiple fields
        if (search && search.trim().length > 0) {
          const searchTerm = search.trim();
          const searchRegex = new RegExp(searchTerm, "i");

          // Find matching presets by title or tags
          const matchingPresets = await Preset.find({
            $or: [{ title: searchRegex }],
          }).select("_id");

          const matchingPresetIds = matchingPresets.map((p) => p._id);

          // Find matching film sims by name
          const matchingFilmSims = await FilmSim.find({
            name: searchRegex,
          }).select("_id");

          const matchingFilmSimIds = matchingFilmSims.map((f) => f._id);

          // Find matching tags
          const matchingTags = await Tag.find({
            $or: [{ name: searchRegex }, { displayName: searchRegex }],
          }).select("_id");

          const matchingTagIds = matchingTags.map((t) => t._id);

          // Find presets that have matching tags
          const presetsWithTags = await Preset.find({
            tags: { $in: matchingTagIds },
          }).select("_id");

          const presetIdsWithTags = presetsWithTags.map((p) => p._id);

          // Combine all matching preset IDs
          const allMatchingPresetIds = [
            ...new Set([...matchingPresetIds, ...presetIdsWithTags]),
          ];

          // Search in list names, descriptions, or lists containing matching presets/filmsims
          query.$or = [
            { name: searchRegex },
            { description: searchRegex },
            { presets: { $in: allMatchingPresetIds } },
            { filmSims: { $in: matchingFilmSimIds } },
          ];
        }

        // Get lists with pagination
        const [lists, totalCount] = await Promise.all([
          UserList.find(query)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("owner", "id username avatar")
            .populate({
              path: "presets",
              select: "id title slug afterImage",
              populate: [{ path: "afterImage", select: "id url" }],
            })
            .populate({
              path: "filmSims",
              select: "id name slug sampleImages",
              populate: { path: "sampleImages", select: "id url" },
            }),
          UserList.countDocuments(query),
        ]);

        const formattedLists = lists.map((list) => {
          const listObj = list.toObject();
          return {
            ...listObj,
            id: listObj._id.toString(),
            owner: {
              id: listObj.owner._id.toString(),
              username: listObj.owner.username,
              avatar: listObj.owner.avatar,
            },
            presets:
              listObj.presets?.map((preset) => ({
                ...preset,
                id: preset._id.toString(),
                afterImage:
                  preset.afterImage && preset.afterImage._id
                    ? {
                        id: preset.afterImage._id.toString(),
                        url: preset.afterImage.url,
                      }
                    : null,
              })) || [],
            filmSims:
              listObj.filmSims?.map((filmSim) => ({
                ...filmSim,
                id: filmSim._id.toString(),
                sampleImages:
                  filmSim.sampleImages?.map((img) => ({
                    id: img._id.toString(),
                    url: img.url,
                  })) || [],
              })) || [],
          };
        });

        return {
          lists: formattedLists,
          totalCount,
          hasNextPage: skip + limit < totalCount,
          hasPreviousPage: page > 1,
        };
      } catch (error) {
        console.error("Error browsing user lists:", error);
        throw new Error("Failed to browse user lists: " + error.message);
      }
    },

    getUserLists: async (_, { userId }) => {
      try {
        const lists = await UserList.find({ owner: userId })
          .populate("owner", "id username avatar")
          .populate({
            path: "presets",
            select: "id title slug afterImage",
            populate: {
              path: "afterImage",
              select: "id url",
            },
          })
          .populate({
            path: "filmSims",
            select: "id name slug sampleImages",
            populate: {
              path: "sampleImages",
              select: "id url",
            },
          });

        return lists.map((list) => {
          const listObj = list.toObject();
          return {
            ...listObj,
            id: listObj._id.toString(),
            owner: {
              id: listObj.owner._id.toString(),
              username: listObj.owner.username || "",
              avatar: listObj.owner.avatar || null,
            },
            presets:
              listObj.presets?.map((preset) => ({
                ...preset,
                id: preset._id.toString(),
                afterImage:
                  preset.afterImage && preset.afterImage._id
                    ? preset.afterImage
                    : null,
              })) || [],
            filmSims:
              listObj.filmSims?.map((filmSim) => ({
                ...filmSim,
                id: filmSim._id.toString(),
                sampleImages: filmSim.sampleImages || [],
              })) || [],
          };
        });
      } catch (error) {
        console.error("Error getting user lists:", error);
        throw new Error("Failed to get user lists: " + error.message);
      }
    },

    getUserList: async (_, { id }) => {
      try {
        const list = await UserList.findById(id)
          .populate({
            path: "presets",
            select: "id title slug afterImage",
            populate: {
              path: "afterImage",
              select: "id url",
            },
          })
          .populate({
            path: "filmSims",
            select: "id name slug sampleImages",
            populate: {
              path: "sampleImages",
              select: "id url",
            },
          })
          .populate("owner", "id username");

        if (!list) {
          throw new Error("List not found");
        }

        const listObj = list.toObject();
        return {
          ...listObj,
          id: listObj._id.toString(),
          owner: {
            id: listObj.owner._id.toString(),
            username: listObj.owner.username,
          },
          presets:
            listObj.presets?.map((preset) => ({
              ...preset,
              id: preset._id.toString(),
              afterImage:
                preset.afterImage && preset.afterImage._id
                  ? preset.afterImage
                  : null,
            })) || [],
          filmSims:
            listObj.filmSims?.map((filmSim) => ({
              ...filmSim,
              id: filmSim._id.toString(),
              sampleImages: filmSim.sampleImages || [],
            })) || [],
        };
      } catch (error) {
        console.error("Error getting user list:", error);
        throw new Error("Failed to get user list: " + error.message);
      }
    },
  },

  Mutation: {
    createUserList: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError("You must be logged in to create a list");
      }

      try {
        const list = await UserList.create({
          name: input.name,
          description: input.description,
          isPublic: input.isPublic || false,
          owner: user._id,
          presets: [],
          filmSims: [],
        });

        const listObj = list.toObject();
        return {
          ...listObj,
          id: listObj._id.toString(),
          owner: {
            id: user._id.toString(),
            username: user.username,
            avatar: user.avatar,
          },
          presets: [],
          filmSims: [],
        };
      } catch (error) {
        console.error("Error creating user list:", error);
        throw new Error("Failed to create user list: " + error.message);
      }
    },

    deleteUserList: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError("You must be logged in to delete a list");
      }

      try {
        const list = await UserList.findById(id);
        if (!list) {
          throw new Error("List not found");
        }

        if (list.owner.toString() !== user._id.toString()) {
          throw new AuthenticationError(
            "You don't have permission to delete this list"
          );
        }

        await UserList.findByIdAndDelete(id);
        return true;
      } catch (error) {
        console.error("Error deleting user list:", error);
        throw error;
      }
    },

    removeFromUserList: async (
      _,
      { listId, presetId, filmSimId },
      { user }
    ) => {
      if (!user) {
        throw new AuthenticationError("You must be logged in to modify lists");
      }

      try {
        const list = await UserList.findById(listId);
        if (!list) {
          throw new Error("List not found");
        }

        if (list.owner.toString() !== user._id.toString()) {
          throw new AuthenticationError(
            "You don't have permission to modify this list"
          );
        }

        if (presetId) {
          list.presets = list.presets.filter(
            (id) => id.toString() !== presetId
          );
        }
        if (filmSimId) {
          list.filmSims = list.filmSims.filter(
            (id) => id.toString() !== filmSimId
          );
        }

        await list.save();

        const updatedList = await UserList.findById(listId)
          .populate({
            path: "presets",
            select: "id title slug afterImage",
            populate: {
              path: "afterImage",
              select: "id url",
            },
          })
          .populate({
            path: "filmSims",
            select: "id name slug sampleImages",
            populate: {
              path: "sampleImages",
              select: "id url",
            },
          })
          .populate("owner", "id username");

        if (!updatedList) {
          throw new Error("Failed to fetch updated list");
        }

        const listObj = updatedList.toObject();
        return {
          ...listObj,
          id: listObj._id.toString(),
          owner: {
            id: listObj.owner._id.toString(),
            username: listObj.owner.username,
          },
          presets:
            listObj.presets?.map((preset) => ({
              ...preset,
              id: preset._id.toString(),
              afterImage:
                preset.afterImage && preset.afterImage._id
                  ? preset.afterImage
                  : null,
            })) || [],
          filmSims:
            listObj.filmSims?.map((filmSim) => ({
              ...filmSim,
              id: filmSim._id.toString(),
              sampleImages: filmSim.sampleImages || [],
            })) || [],
        };
      } catch (error) {
        console.error("Error removing item from list:", error);
        throw error;
      }
    },

    addToUserList: async (_, { listId, presetIds, filmSimIds }, { user }) => {
      if (!user) {
        throw new AuthenticationError("You must be logged in to modify lists");
      }

      try {
        const list = await UserList.findById(listId);
        if (!list) {
          throw new Error("List not found");
        }

        if (list.owner.toString() !== user._id.toString()) {
          throw new AuthenticationError(
            "You don't have permission to modify this list"
          );
        }

        if (presetIds && presetIds.length > 0) {
          list.presets = [...new Set([...list.presets, ...presetIds])];
        }

        if (filmSimIds && filmSimIds.length > 0) {
          list.filmSims = [...new Set([...list.filmSims, ...filmSimIds])];
        }

        await list.save();

        const updatedList = await UserList.findById(listId)
          .populate({
            path: "presets",
            select: "id title slug afterImage",
            populate: {
              path: "afterImage",
              select: "id url",
            },
          })
          .populate({
            path: "filmSims",
            select: "id name slug sampleImages",
            populate: {
              path: "sampleImages",
              select: "id url",
            },
          })
          .populate("owner", "id username");

        if (!updatedList) {
          throw new Error("Failed to fetch updated list");
        }

        const listObj = updatedList.toObject();
        return {
          ...listObj,
          id: listObj._id.toString(),
          owner: {
            id: listObj.owner._id.toString(),
            username: listObj.owner.username,
          },
          presets:
            listObj.presets?.map((preset) => ({
              ...preset,
              id: preset._id.toString(),
              afterImage:
                preset.afterImage && preset.afterImage._id
                  ? preset.afterImage
                  : null,
            })) || [],
          filmSims:
            listObj.filmSims?.map((filmSim) => ({
              ...filmSim,
              id: filmSim._id.toString(),
              sampleImages: filmSim.sampleImages || [],
            })) || [],
        };
      } catch (error) {
        console.error("Error adding to list:", error);
        throw error;
      }
    },

    updateUserList: async (_, { id, input }, { user }) => {
      console.log("updateUserList called with:", {
        id,
        input,
        userId: user?._id,
      });

      if (!user) {
        throw new Error("You must be logged in to update a list");
      }

      const list = await UserList.findById(id);
      if (!list) {
        throw new Error("List not found");
      }

      if (list.owner.toString() !== user._id.toString()) {
        throw new Error("You can only update your own lists");
      }

      const updatedList = await UserList.findByIdAndUpdate(
        id,
        {
          $set: {
            name: input.name,
            description: input.description,
            isPublic: input.isPublic,
          },
        },
        { new: true }
      ).populate("owner", "_id username avatar");

      if (!updatedList) {
        throw new Error("Failed to update list");
      }

      console.log("List updated successfully:", updatedList);

      return {
        id: updatedList._id.toString(),
        name: updatedList.name,
        description: updatedList.description,
        isPublic: updatedList.isPublic,
        isFeatured: updatedList.isFeatured,
        owner: {
          id: updatedList.owner._id.toString(),
          username: updatedList.owner.username,
          avatar: updatedList.owner.avatar,
        },
      };
    },

    featureUserList: async (_, { id }, { user }) => {
      if (!user || !user.isAdmin) {
        throw new AuthenticationError("Only administrators can feature lists");
      }
      // First, unfeature all other lists
      await UserList.updateMany(
        { _id: { $ne: id } },
        { $set: { isFeatured: false } }
      );
      // Then feature the selected list
      const updated = await UserList.findByIdAndUpdate(
        id,
        { $set: { isFeatured: true } },
        { new: true }
      ).populate("owner", "_id username avatar");
      if (!updated) throw new Error("List not found");
      return {
        id: updated._id.toString(),
        name: updated.name,
        description: updated.description,
        isPublic: updated.isPublic,
        isFeatured: updated.isFeatured,
        owner: {
          id: updated.owner._id.toString(),
          username: updated.owner.username,
          avatar: updated.owner.avatar,
        },
      };
    },

    unfeatureUserList: async (_, { id }, { user }) => {
      if (!user || !user.isAdmin) {
        throw new AuthenticationError(
          "Only administrators can remove featured status"
        );
      }
      const updated = await UserList.findByIdAndUpdate(
        id,
        { $set: { isFeatured: false } },
        { new: true }
      ).populate("owner", "_id username avatar");
      if (!updated) throw new Error("List not found");
      return {
        id: updated._id.toString(),
        name: updated.name,
        description: updated.description,
        isPublic: updated.isPublic,
        isFeatured: updated.isFeatured,
        owner: {
          id: updated.owner._id.toString(),
          username: updated.owner.username,
          avatar: updated.owner.avatar,
        },
      };
    },
  },
};
