const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    preset: { type: Schema.Types.ObjectId, ref: "Preset" },
    filmSim: { type: Schema.Types.ObjectId, ref: "FilmSim" },
    parent: { type: Schema.Types.ObjectId, ref: "Comment" },
    reactions: {
      thumbsUp: [{ type: Schema.Types.ObjectId, ref: "User" }],
      heart: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
