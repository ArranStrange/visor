const mongoose = require("mongoose");
const { Schema } = mongoose;

const linkedItemSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  slug: String,
});

const notificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        "DISCUSSION_REPLY",
        "DISCUSSION_OWNER_REPLY",
        "MENTION",
        "FOLLOW",
        "LIKE",
        "INFO",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    discussionId: {
      type: Schema.Types.ObjectId,
      ref: "Discussion",
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "DiscussionPost",
    },
    linkedItem: linkedItemSchema,
  },
  { timestamps: true }
);

// Indexes for better query performance
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ senderId: 1 });
notificationSchema.index({ discussionId: 1 });
notificationSchema.index({ postId: 1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
