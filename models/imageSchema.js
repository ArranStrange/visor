const mongoose = require("mongoose");
const { Schema } = mongoose;

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    caption: String,
    uploader: { type: Schema.Types.ObjectId, ref: "User" },
    preset: { type: Schema.Types.ObjectId, ref: "Preset" },
    filmSim: { type: Schema.Types.ObjectId, ref: "FilmSim" },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Image", imageSchema);
