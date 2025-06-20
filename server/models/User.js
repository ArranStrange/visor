const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    avatar: String,
    bio: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Uploads by the user
    uploadedPresets: [{ type: Schema.Types.ObjectId, ref: "Preset" }],
    uploadedFilmSims: [{ type: Schema.Types.ObjectId, ref: "FilmSim" }],

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

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
