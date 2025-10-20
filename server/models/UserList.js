const mongoose = require("mongoose");
const { Schema } = mongoose;

const userListSchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    presets: [{ type: Schema.Types.ObjectId, ref: "Preset" }],
    filmSims: [{ type: Schema.Types.ObjectId, ref: "FilmSim" }],
    isFavouriteList: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    collaborators: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Text index for search
userListSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("UserList", userListSchema);
