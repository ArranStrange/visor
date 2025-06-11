// models/Tag.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const tagSchema = new Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. "vintage"
    displayName: { type: String, required: true }, // e.g. "Vintage"
    category: {
      type: String,
      enum: ["preset", "film", "camera"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tag", tagSchema);
