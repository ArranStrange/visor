const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");
const { createToken, tokensMatch } = require("../utils/authTokens");

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    avatar: String,
    bio: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Elevated privileges. Never client-settable: updateProfile allow-lists
    // bio/instagram/cameras/avatar only, so this is set out of band.
    isAdmin: { type: Boolean, default: false },

    // Email verification. The token is stored as a SHA-256 digest, so reading
    // this collection does not let you verify somebody else's address.
    emailVerified: { type: Boolean, default: false },
    verificationToken: String,
    tokenExpiry: Date,

    // Password reset. Deliberately separate fields from verification: verifyEmail
    // clears the verification pair unconditionally, so sharing them would let an
    // address re-verification silently kill an in-flight reset.
    resetTokenHash: String,
    resetTokenExpiry: Date,

    // Set whenever the password or email changes. Tokens issued before this
    // moment are rejected by the auth middleware, so a credential change signs
    // out every other session.
    credentialsChangedAt: Date,

    // Tombstone marker. A deleted account keeps its document so content and
    // discussion threads stay readable, but the middleware treats it as absent.
    deletedAt: Date,

    // Uploads by the user
    uploadedPresets: [{ type: Schema.Types.ObjectId, ref: "Preset" }],
    uploadedFilmSims: [{ type: Schema.Types.ObjectId, ref: "FilmSim" }],

    // Favourites stored as references to custom lists
    favouriteLists: [{ type: Schema.Types.ObjectId, ref: "UserList" }],

    // User-created custom lists (folders with presets or sims)
    customLists: [{ type: Schema.Types.ObjectId, ref: "UserList" }],

    // Cameras they use, represented as strings or could be ObjectId if you want camera documents
    cameras: [String],

    // The body the app personalises for: compatibility verdicts, dial-in
    // guidance, the sensor list filter. Stored as the canonical catalogue
    // name (e.g. "X-T30 II"), never a display string the user typed —
    // updateProfile resolves it through findCamera and rejects unknowns.
    primaryCamera: String,

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

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour — shorter: it grants a password change

// Returns the raw token to put in the email. Only its digest is stored.
userSchema.methods.generateVerificationToken = function () {
  const { raw, hash } = createToken();
  this.verificationToken = hash;
  this.tokenExpiry = new Date(Date.now() + VERIFICATION_TTL_MS);
  return raw;
};

userSchema.methods.verifyToken = function (token) {
  if (!this.tokenExpiry || this.tokenExpiry <= new Date()) return false;
  return tokensMatch(token, this.verificationToken);
};

userSchema.methods.generateResetToken = function () {
  const { raw, hash } = createToken();
  this.resetTokenHash = hash;
  this.resetTokenExpiry = new Date(Date.now() + RESET_TTL_MS);
  return raw;
};

userSchema.methods.verifyResetToken = function (token) {
  if (!this.resetTokenExpiry || this.resetTokenExpiry <= new Date()) return false;
  return tokensMatch(token, this.resetTokenHash);
};

// Single-use: called on a successful reset and on every login, so a reset link
// stops working the moment it is used or the account is otherwise accessed.
userSchema.methods.clearResetToken = function () {
  this.resetTokenHash = undefined;
  this.resetTokenExpiry = undefined;
};

module.exports = mongoose.model("User", userSchema);
