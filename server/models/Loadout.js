const mongoose = require("mongoose");
const { Schema } = mongoose;
const { findCamera, normalizeCameraName } = require("../constants/fujifilmCameras");

/**
 * What is in a specific camera right now. Distinct from UserList, which
 * stays the unordered library: a loadout is ordered, capped by the body's
 * custom-bank count, and bound to one camera.
 *
 * Design decisions (issue #98 review round):
 *  - camera is the display string as the user wrote it; cameraKey is the
 *    normalized identity used for lookups and the active-per-body rule.
 *  - customBanks is snapshotted at creation so later corrections to the
 *    camera catalog can't invalidate existing loadouts.
 *  - filmSimName is snapshotted per slot so a deleted or privatized recipe
 *    still names what is physically keyed into the camera.
 *  - Staleness is derived, never stored: slotsChangedAt (bumped only by
 *    slot mutations) vs keyedInAt. Doc-level updatedAt is NOT used — a
 *    rename must not flag a loadout as stale.
 *  - Slot uniqueness and capacity are enforced in a document validator,
 *    not an index: MongoDB unique multikey indexes do not reject repeated
 *    values within one document's array.
 */

const slotSchema = new Schema(
  {
    // 0-based; rendered as C1..Cn.
    index: { type: Number, required: true, min: 0 },
    // Nullable: an empty slot is a real state, and a deleted recipe must
    // leave a hole at a stable position, never shift its neighbours.
    filmSim: { type: Schema.Types.ObjectId, ref: "FilmSim", default: null },
    // Snapshot of the recipe name at assignment time.
    filmSimName: { type: String, default: null },
    // Snapshot of the recipe's in-camera settings, taken at
    // markLoadoutKeyedIn — what the camera actually holds. Compared to the
    // live recipe at read time to derive SOURCE_CHANGED staleness (#101).
    // null = this slot has never been keyed in as currently assigned.
    keyedInSettings: { type: Schema.Types.Mixed, default: null },
    note: { type: String, maxlength: 200 },
  },
  { _id: false }
);

const loadoutSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Display form, as the user wrote it ("Fujifilm X-T5").
    camera: { type: String, required: true, trim: true },
    // Identity form ("xt5") — set from camera in pre-validate.
    cameraKey: { type: String, required: true },
    // Snapshot of the body's bank count at creation.
    customBanks: { type: Number, required: true, min: 1 },

    slots: {
      type: [slotSchema],
      default: [],
      validate: {
        validator: function (slots) {
          const indices = slots.map((s) => s.index);
          if (new Set(indices).size !== indices.length) return false;
          return indices.every(
            (i) => Number.isInteger(i) && i >= 0 && i < this.customBanks
          );
        },
        message:
          "Slot indices must be unique integers within the camera's bank count",
      },
    },

    // Exactly one active loadout per owner+cameraKey (partial unique index
    // below; resolvers unset siblings first as the primary mechanism).
    isActive: { type: Boolean, default: false },

    // When the user last attested the loadout is keyed into the body.
    keyedInAt: { type: Date, default: null },
    // Bumped only by slot mutations; stale ⇔ slotsChangedAt > keyedInAt.
    slotsChangedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

loadoutSchema.index({ owner: 1, cameraKey: 1 });
// Backstop for the one-active-per-body rule: only documents with
// isActive: true enter this index, so a second concurrent activate that
// slips past the resolver's unset-siblings step fails at the database.
loadoutSchema.index(
  { owner: 1, cameraKey: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

loadoutSchema.pre("validate", function (next) {
  // Only re-resolve the catalog when the camera is set or changed. A later
  // catalog correction (body removed, banks set to 0) must never make
  // existing loadouts unsaveable — that's the invalidation the customBanks
  // snapshot exists to prevent.
  if (this.camera && (this.isNew || this.isModified("camera"))) {
    const entry = findCamera(this.camera);
    if (!entry) {
      return next(
        new Error(`Unknown camera "${this.camera}" — not in the Fujifilm catalog`)
      );
    }
    if (entry.customBanks < 1) {
      return next(
        new Error(
          `${entry.name} has no custom settings banks, so it can't hold a loadout`
        )
      );
    }
    this.cameraKey = normalizeCameraName(this.camera);
    // Snapshot once; never overwrite on subsequent saves.
    if (this.isNew && this.customBanks == null) {
      this.customBanks = entry.customBanks;
    }
  }
  next();
});

module.exports = mongoose.model("Loadout", loadoutSchema);
