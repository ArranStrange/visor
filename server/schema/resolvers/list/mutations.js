const UserList = require("../../../models/UserList");
const { createLogger } = require("../../../utils/logger");
const {
  requireAdmin,
  requireAuth,
  requireOwnership,
} = require("../../../utils/authHelpers");
const { serializeUserListDetail } = require("./services/listSerializers");

const logger = createLogger("resolvers:list");

module.exports = {
  createUserList: async (_, { input }, { user }) => {
    requireAuth(user, "You must be logged in to create a list");

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
      logger.error("Error creating user list", error);
      throw new Error("Failed to create user list: " + error.message);
    }
  },

  deleteUserList: async (_, { id }, { user }) => {
    requireAuth(user, "You must be logged in to delete a list");

    try {
      const list = await UserList.findById(id);
      if (!list) {
        throw new Error("List not found");
      }

      requireOwnership(user, list, "owner", {
        allowAdmin: false,
        message: "You don't have permission to delete this list",
      });

      await UserList.findByIdAndDelete(id);
      return true;
    } catch (error) {
      logger.error("Error deleting user list", error);
      throw error;
    }
  },

  removeFromUserList: async (
    _,
    { listId, presetId, filmSimId },
    { user }
  ) => {
    requireAuth(user, "You must be logged in to modify lists");

    try {
      const list = await UserList.findById(listId);
      if (!list) {
        throw new Error("List not found");
      }

      requireOwnership(user, list, "owner", {
        allowAdmin: false,
        message: "You don't have permission to modify this list",
      });

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

      return serializeUserListDetail(updatedList);
    } catch (error) {
      logger.error("Error removing item from list", error);
      throw error;
    }
  },

  addToUserList: async (_, { listId, presetIds, filmSimIds }, { user }) => {
    requireAuth(user, "You must be logged in to modify lists");

    try {
      const list = await UserList.findById(listId);
      if (!list) {
        throw new Error("List not found");
      }

      requireOwnership(user, list, "owner", {
        allowAdmin: false,
        message: "You don't have permission to modify this list",
      });

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

      return serializeUserListDetail(updatedList);
    } catch (error) {
      logger.error("Error adding to list", error);
      throw error;
    }
  },

  updateUserList: async (_, { id, input }, { user }) => {
    requireAuth(user, "You must be logged in to update a list");

    const list = await UserList.findById(id);
    if (!list) {
      throw new Error("List not found");
    }

    requireOwnership(user, list, "owner", {
      allowAdmin: false,
      message: "You can only update your own lists",
    });

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
    requireAdmin(user, "Only administrators can feature lists");
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
    requireAdmin(user, "Only administrators can remove featured status");
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
};
