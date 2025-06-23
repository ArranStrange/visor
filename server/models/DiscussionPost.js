const mongoose = require("mongoose");
const { Schema } = mongoose;

const mentionSchema = new Schema({
  type: {
    type: String,
    enum: ["user", "preset", "filmsim"],
    required: true,
  },
  refId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
});

const reactionSchema = new Schema({
  emoji: {
    type: String,
    required: true,
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const discussionPostSchema = new Schema(
  {
    discussionId: {
      type: Schema.Types.ObjectId,
      ref: "Discussion",
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "DiscussionPost",
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "DiscussionPost",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
    },
    mentions: [mentionSchema],
    reactions: [reactionSchema],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
discussionPostSchema.index({ discussionId: 1, createdAt: 1 });
discussionPostSchema.index({ parentId: 1, createdAt: 1 });
discussionPostSchema.index({ author: 1, createdAt: -1 });
discussionPostSchema.index({ content: "text" });
discussionPostSchema.index({ "mentions.refId": 1 });

module.exports = mongoose.model("DiscussionPost", discussionPostSchema);
