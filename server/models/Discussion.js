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
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
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
    postCount: {
      type: Number,
      default: 0,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
discussionSchema.index({ "linkedTo.type": 1, "linkedTo.refId": 1 });
discussionSchema.index({ createdBy: 1, createdAt: -1 });
discussionSchema.index({ tags: 1 });
discussionSchema.index({ title: "text", tags: "text" });
discussionSchema.index({ lastActivity: -1 });

module.exports = mongoose.model("Discussion", discussionSchema);
