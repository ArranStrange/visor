const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    avatar: String,
    bio: String,
    email: { type: String, required: true, unique: true },
    favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Preset" }],
    cameras: [String],
    instagram: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
