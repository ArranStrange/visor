const mongoose = require("mongoose");
const { Schema } = mongoose;

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    description: String,
    category: {
      type: String, // e.g., "mood", "style", "subject", "film", "camera"
      required: true,
    },
    relatedTags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tag", tagSchema);
