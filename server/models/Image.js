const mongoose = require("mongoose");
const { Schema } = mongoose;

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      default: "",
    },
    caption: String,
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    associatedWith: {
      kind: {
        type: String,
        enum: ["Preset", "FilmSim", "User", "List"],
        required: true,
      },
      item: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "associatedWith.kind",
      },
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    isBeforeImage: {
      type: Boolean,
      default: false,
    },
    isAfterImage: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Image", imageSchema);
