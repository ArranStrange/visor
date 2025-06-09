const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    avatar: String,
    bio: String,
    email: { type: String, required: true, unique: true },

    // Uploads by the user
    uploadedPresets: [{ type: Schema.Types.ObjectId, ref: "Preset" }],
    uploadedFilmSims: [{ type: Schema.Types.ObjectId, ref: "FilmSimulation" }],

    // Favourites stored as references to custom lists
    favouriteLists: [{ type: Schema.Types.ObjectId, ref: "UserList" }],

    // User-created custom lists (folders with presets or sims)
    customLists: [{ type: Schema.Types.ObjectId, ref: "UserList" }],

    // Cameras they use, represented as strings or could be ObjectId if you want camera documents
    cameras: [String],

    instagram: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
