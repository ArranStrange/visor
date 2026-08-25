const { UserInputError } = require("apollo-server-express");
const { isValidObjectId } = require("mongoose");
const Loadout = require("../../../models/Loadout");
const FilmSim = require("../../../models/FilmSim");
const {
  findCamera,
  normalizeCameraName,
} = require("../../../constants/fujifilmCameras");
const { requireAuth, requireOwnership } = require("../../../utils/authHelpers");
const { createLogger } = require("../../../utils/logger");
const {
  serializeLoadout,
  LOADOUT_POPULATE,
} = require("./services/loadoutSerializer");
const { validateSlotInputs, mergeSlots } = require("./services/mergeSlots");
const { pickSettings } = require("./services/settingsSnapshot");

const logger = createLogger("resolvers:loadout");

const MAX_NAME_LENGTH = 80;
const MAX_NOTE_LENGTH = 200;

// MongoDB duplicate-key error — the partial unique index backstop firing.
const isDuplicateKeyError = (error) => error && error.code === 11000;

// Every mutation returns the fully populated loadout so the client cache
// stays coherent from the mutation response alone.
const reload = async (id) => {
  const loadout = await Loadout.findById(id).populate(LOADOUT_POPULATE);
  return serializeLoadout(loadout);
};

const findOwned = async (id, user, action) => {
  if (!isValidObjectId(id)) throw new UserInputError("Loadout not found");
  const loadout = await Loadout.findById(id);
  if (!loadout) throw new UserInputError("Loadout not found");
  requireOwnership(user, loadout, "owner", {
    allowAdmin: false,
    message: `You don't have permission to ${action} this loadout`,
  });
  return loadout;
};

const validateName = (name) => {
  const trimmed = (name || "").trim();
  if (!trimmed) throw new UserInputError("Loadout name can't be empty");
  if (trimmed.length > MAX_NAME_LENGTH) {
    throw new UserInputError(
      `Loadout name must be ${MAX_NAME_LENGTH} characters or fewer`
    );
  }
  return trimmed;
};

module.exports = {
  createLoadout: async (_, { input }, { user }) => {
    requireAuth(user, "You must be logged in to create a loadout");

    const name = validateName(input.name);
    const entry = findCamera(input.camera);
    if (!entry) {
      throw new UserInputError(
        `Unknown camera "${input.camera}" — pick a body from the Fujifilm catalog`
      );
    }
    if (entry.customBanks < 1) {
      throw new UserInputError(
        `${entry.name} has no custom settings banks, so it can't hold a loadout`
      );
    }

    // First loadout for this body auto-activates, so the wallet has an
    // active loadout without a separate step.
    const create = async (isActive) =>
      Loadout.create({
        name,
        owner: user._id,
        camera: entry.name, // store the canonical display name
        customBanks: entry.customBanks,
        isActive,
      });

    try {
      const hasActive = await Loadout.exists({
        owner: user._id,
        cameraKey: normalizeCameraName(input.camera),
        isActive: true,
      });

      let loadout;
      try {
        loadout = await create(!hasActive);
      } catch (error) {
        // Two concurrent first-creates both saw no active loadout; the
        // partial unique index caught the second. Retry it inactive.
        if (!isDuplicateKeyError(error)) throw error;
        loadout = await create(false);
      }

      return reload(loadout._id);
    } catch (error) {
      logger.error("Error creating loadout", error);
      throw new Error("Failed to create loadout");
    }
  },

  renameLoadout: async (_, { id, name }, { user }) => {
    requireAuth(user, "You must be logged in to rename a loadout");
    const trimmed = validateName(name);
    const loadout = await findOwned(id, user, "rename");

    try {
      // Deliberately does NOT touch slotsChangedAt — a rename never makes
      // a loadout stale.
      loadout.name = trimmed;
      await loadout.save();
      return reload(loadout._id);
    } catch (error) {
      logger.error("Error renaming loadout", error);
      throw new Error("Failed to rename loadout");
    }
  },

  deleteLoadout: async (_, { id }, { user }) => {
    requireAuth(user, "You must be logged in to delete a loadout");
    const loadout = await findOwned(id, user, "delete");

    try {
      await Loadout.findByIdAndDelete(loadout._id);
      return true;
    } catch (error) {
      logger.error("Error deleting loadout", error);
      throw new Error("Failed to delete loadout");
    }
  },

  setLoadoutSlots: async (_, { id, slots }, { user }) => {
    requireAuth(user, "You must be logged in to edit a loadout");
    const loadout = await findOwned(id, user, "edit");

    try {
      validateSlotInputs(slots, loadout.customBanks);
    } catch (error) {
      throw new UserInputError(error.message);
    }

    for (const s of slots) {
      if (s.filmSimId && !isValidObjectId(s.filmSimId)) {
        throw new UserInputError(`Film sim ${s.filmSimId} not found`);
      }
      if (s.note && s.note.length > MAX_NOTE_LENGTH) {
        throw new UserInputError(
          `Slot notes must be ${MAX_NOTE_LENGTH} characters or fewer`
        );
      }
    }

    try {
      // Resolve referenced film sims in one query, restricted to what the
      // caller may attach: public recipes or their own.
      const filmSimIds = slots.map((s) => s.filmSimId).filter(Boolean);
      const filmSims = filmSimIds.length
        ? await FilmSim.find({
            _id: { $in: filmSimIds },
            $or: [{ isPublic: true }, { creator: user._id }],
          }).select("name")
        : [];
      const nameById = new Map(
        filmSims.map((f) => [f._id.toString().toLowerCase(), f.name])
      );

      const assignmentsOf = (slotArray) =>
        JSON.stringify(
          slotArray
            .filter((s) => s.filmSim)
            .map((s) => [s.index, s.filmSim.toString().toLowerCase()])
            .sort((a, b) => a[0] - b[0])
        );
      const before = assignmentsOf(loadout.slots);

      loadout.slots = mergeSlots(slots, loadout.slots, nameById);
      // Staleness tracks what the CAMERA holds. A note-only edit changes
      // nothing on the body, so it must not flag the loadout stale.
      if (assignmentsOf(loadout.slots) !== before) {
        loadout.slotsChangedAt = new Date();
      }
      await loadout.save();

      return reload(loadout._id);
    } catch (error) {
      if (error instanceof UserInputError) throw error;
      if (error.code === "FILM_SIM_NOT_FOUND") {
        // mergeSlots rejecting an id the visibility filter excluded.
        throw new UserInputError(error.message);
      }
      logger.error("Error setting loadout slots", error);
      throw new Error("Failed to set loadout slots");
    }
  },

  setActiveLoadout: async (_, { id }, { user }) => {
    requireAuth(user, "You must be logged in to activate a loadout");
    const loadout = await findOwned(id, user, "activate");

    try {
      // Unset siblings first; the partial unique index is the backstop
      // against a concurrent activate racing this two-step.
      await Loadout.updateMany(
        {
          owner: user._id,
          cameraKey: loadout.cameraKey,
          _id: { $ne: loadout._id },
          isActive: true,
        },
        { $set: { isActive: false } }
      );
      loadout.isActive = true;
      await loadout.save();

      return reload(loadout._id);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new UserInputError(
          "Another loadout was just activated for this camera — refresh and try again"
        );
      }
      logger.error("Error activating loadout", error);
      throw new Error("Failed to activate loadout");
    }
  },

  markLoadoutKeyedIn: async (_, { id }, { user }) => {
    requireAuth(user, "You must be logged in to update a loadout");
    const loadout = await findOwned(id, user, "update");

    try {
      // Snapshot each slot's current recipe settings — this is what the
      // camera now physically holds. Read time compares these against the
      // live recipe to surface SOURCE_CHANGED staleness (#101).
      //
      // Fetched via a separate query rather than populate: populating
      // slots.filmSim and restoring the refs afterwards erases the stored
      // ObjectId for dangling (deleted-recipe) slots, and this mutation
      // must never rewrite references — it's an attestation.
      const ids = loadout.slots.map((s) => s.filmSim).filter(Boolean);
      const filmSims = ids.length
        ? await FilmSim.find({ _id: { $in: ids } }).select("settings")
        : [];
      const settingsById = new Map(
        filmSims.map((f) => [
          f._id.toString(),
          pickSettings(f.settings?.toObject ? f.settings.toObject() : f.settings),
        ])
      );
      for (const slot of loadout.slots) {
        slot.keyedInSettings = slot.filmSim
          ? (settingsById.get(slot.filmSim.toString()) ?? null)
          : null;
      }
      loadout.keyedInAt = new Date();
      await loadout.save();
      return reload(loadout._id);
    } catch (error) {
      logger.error("Error marking loadout keyed in", error);
      throw new Error("Failed to mark loadout keyed in");
    }
  },
};
