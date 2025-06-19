const { GraphQLUpload } = require("graphql-upload");
const GraphQLJSON = require("graphql-type-json");

const Comment = require("../models/comment");
const Image = require("../models/Image");
const User = require("../models/User");

module.exports = {
  Upload: GraphQLUpload,
  JSON: GraphQLJSON,

  Query: {
    getImage: async (_, { id }) => await Image.findById(id),
    listImagesByPreset: async (_, { presetId }) =>
      await Image.find({ preset: presetId }),
    getCommentsForPreset: async (_, { presetId }) =>
      await Comment.find({ preset: presetId, parent: null }),
    getCommentsForFilmSim: async (_, { filmSimId }) =>
      await Comment.find({ filmSim: filmSimId, parent: null }),
  },

  Mutation: {
    createComment: async (_, { input }, { user }) => {
      const comment = new Comment({ ...input, author: user.id });
      return await comment.save();
    },

    reactToComment: async (_, { commentId, reaction }, { user }) => {
      const comment = await Comment.findById(commentId);
      comment.reactions[reaction] = comment.reactions[reaction] || [];
      if (!comment.reactions[reaction].includes(user.id)) {
        comment.reactions[reaction].push(user.id);
        await comment.save();
      }
      return comment;
    },

    deleteComment: async (_, { id }, { user }) => {
      const comment = await Comment.findById(id);
      if (comment.author.toString() === user.id.toString()) {
        await Comment.findByIdAndDelete(id);
        return true;
      }
      return false;
    },
  },

  Comment: {
    author: async (comment) => await User.findById(comment.author),
    parent: async (comment) =>
      comment.parent ? await Comment.findById(comment.parent) : null,
  },
};
