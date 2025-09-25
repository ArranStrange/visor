const mongoose = require("mongoose");
const { Schema } = mongoose;

const discussionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    linkedTo: {
      type: {
        type: String,
        enum: ["preset", "filmsim"],
        required: true,
      },
      refId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: "linkedTo.type",
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        avatar: String,
        content: {
          type: String,
          required: true,
          trim: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        isEdited: {
          type: Boolean,
          default: false,
        },
        editedAt: Date,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

discussionSchema.index({ "linkedTo.type": 1, "linkedTo.refId": 1 });
discussionSchema.index({ createdBy: 1, createdAt: -1 });
discussionSchema.index({ title: "text" });
discussionSchema.index({ updatedAt: -1 });

module.exports = mongoose.model("Discussion", discussionSchema);
