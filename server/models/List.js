const mongoose = require("mongoose");

const listSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    isPublic: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // items can be presets or film sims
    items: [
      {
        kind: {
          type: String,
          enum: ["Preset", "FilmSim"],
          required: true,
        },
        item: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "items.kind",
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// optional: text index for search
listSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("List", listSchema);
