const Preset = require("../../../models/Preset");
const FilmSim = require("../../../models/FilmSim");

module.exports = {
  Discussion: {
    linkedTo: async (discussion) => {
      let linkedItem = null;

      if (discussion.linkedTo.type === "preset") {
        linkedItem = await Preset.findById(discussion.linkedTo.refId)
          .populate("afterImage")
          .populate("beforeImage");
      } else if (discussion.linkedTo.type === "filmsim") {
        linkedItem = await FilmSim.findById(discussion.linkedTo.refId).populate(
          "sampleImages"
        );
      }

      return {
        type: discussion.linkedTo.type.toUpperCase(),
        refId: discussion.linkedTo.refId,
        preset: discussion.linkedTo.type === "preset" ? linkedItem : null,
        filmSim: discussion.linkedTo.type === "filmsim" ? linkedItem : null,
      };
    },
    createdAt: (discussion) => {
      return discussion.createdAt
        ? discussion.createdAt.toISOString()
        : new Date().toISOString();
    },
    updatedAt: (discussion) => {
      return discussion.updatedAt
        ? discussion.updatedAt.toISOString()
        : new Date().toISOString();
    },
  },

  DiscussionPost: {
    timestamp: (post) => {
      return post.timestamp
        ? post.timestamp.toISOString()
        : new Date().toISOString();
    },
    editedAt: (post) => {
      return post.editedAt ? post.editedAt.toISOString() : null;
    },
  },

  DiscussionReply: {
    timestamp: (reply) => {
      return reply.timestamp
        ? reply.timestamp.toISOString()
        : new Date().toISOString();
    },
    editedAt: (reply) => {
      return reply.editedAt ? reply.editedAt.toISOString() : null;
    },
  },
};
