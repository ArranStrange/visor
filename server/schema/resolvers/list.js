const { AuthenticationError } = require("../../utils/errors");
const UserList = require("../../models/UserList");

module.exports = {
  Query: {
    getUserLists: async (_, { userId }) => {
      try {
        const lists = await UserList.find({ owner: userId })
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

        // Convert all ObjectIds to strings
        return lists.map((list) => {
          const listObj = list.toObject();
          return {
            ...listObj,
            id: listObj._id.toString(),
            owner: {
              id: listObj.owner.toString(),
              username: listObj.owner.username || "",
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

        // Format the response to match the expected structure
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

        // Check if user is the owner
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

        // Check if user is the owner
        if (list.owner.toString() !== user._id.toString()) {
          throw new AuthenticationError(
            "You don't have permission to modify this list"
          );
        }

        // Remove the item based on type
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

        // Fetch the updated list with populated data
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

        // Format the response
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

        // Check if user is the owner
        if (list.owner.toString() !== user._id.toString()) {
          throw new AuthenticationError(
            "You don't have permission to modify this list"
          );
        }

        // Add presets if provided
        if (presetIds && presetIds.length > 0) {
          list.presets = [...new Set([...list.presets, ...presetIds])];
        }

        // Add film sims if provided
        if (filmSimIds && filmSimIds.length > 0) {
          list.filmSims = [...new Set([...list.filmSims, ...filmSimIds])];
        }

        await list.save();

        // Fetch the updated list with populated data
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

        // Format the response
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

      // Find the list and check ownership
      const list = await UserList.findById(id);
      if (!list) {
        throw new Error("List not found");
      }

      if (list.owner.toString() !== user._id.toString()) {
        throw new Error("You can only update your own lists");
      }

      // Update the list with the new values
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

      // Format the response
      return {
        id: updatedList._id.toString(),
        name: updatedList.name,
        description: updatedList.description,
        isPublic: updatedList.isPublic,
        owner: {
          id: updatedList.owner._id.toString(),
          username: updatedList.owner.username,
          avatar: updatedList.owner.avatar,
        },
      };
    },
  },
};
