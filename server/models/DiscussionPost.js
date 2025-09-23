const mongoose = require("mongoose");
const { Schema } = mongoose;

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
discussionPostSchema.index({ isDeleted: 1, createdAt: -1 });

module.exports = mongoose.model("DiscussionPost", discussionPostSchema);
