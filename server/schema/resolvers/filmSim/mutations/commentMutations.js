const FilmSim = require("../../../../models/FilmSim");
const { createLogger } = require("../../../../utils/logger");
const {
  requireAuth,
  requireOwnership,
} = require("../../../../utils/authHelpers");

const logger = createLogger("resolvers:filmSim");

module.exports = {
  addComment: async (_, { filmSimId, text }, { user }) => {
    requireAuth(user, "Not authenticated");

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
      logger.error("Add comment error", error);
      throw error;
    }
  },

  updateComment: async (_, { filmSimId, commentId, text }, { user }) => {
    requireAuth(user, "Not authenticated");

    try {
      const filmSim = await FilmSim.findById(filmSimId);
      if (!filmSim) {
        throw new Error("Film simulation not found");
      }

      const comment = filmSim.comments.id(commentId);
      if (!comment) {
        throw new Error("Comment not found");
      }

      requireOwnership(user, comment, "user", { allowAdmin: false });

      comment.text = text;
      comment.updatedAt = new Date();
      await filmSim.save();

      const populatedFilmSim = await FilmSim.findById(filmSimId).populate({
        path: "comments.user",
        select: "username avatar",
      });

      return populatedFilmSim.comments.id(commentId);
    } catch (error) {
      logger.error("Update comment error", error);
      throw error;
    }
  },

  deleteComment: async (_, { filmSimId, commentId }, { user }) => {
    requireAuth(user, "Not authenticated");

    try {
      const filmSim = await FilmSim.findById(filmSimId);
      if (!filmSim) {
        throw new Error("Film simulation not found");
      }

      const comment = filmSim.comments.id(commentId);
      if (!comment) {
        throw new Error("Comment not found");
      }

      requireOwnership(user, comment, "user", { allowAdmin: false });

      comment.remove();
      await filmSim.save();
      return true;
    } catch (error) {
      logger.error("Delete comment error", error);
      throw error;
    }
  },
};
