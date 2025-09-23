const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    avatar: String,
    bio: String,
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Made optional for Firebase users
    firebaseUid: { type: String, unique: true, sparse: true }, // Firebase UID

    // Email verification fields
    emailVerified: { type: Boolean, default: false },
    verificationToken: String,
    tokenExpiry: Date,

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

// Hash password before saving (only for non-Firebase users)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to check password (only for non-Firebase users)
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false; // Firebase users don't have passwords
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate verification token
userSchema.methods.generateVerificationToken = function () {
  const crypto = require("crypto");
  this.verificationToken = crypto.randomBytes(32).toString("hex");
  this.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return this.verificationToken;
};

// Method to verify token
userSchema.methods.verifyToken = function (token) {
  return this.verificationToken === token && this.tokenExpiry > new Date();
};

module.exports = mongoose.model("User", userSchema);
