const crypto = require("crypto");

const Loadout = require("../../../../models/Loadout");
const Notification = require("../../../../models/Notification");
const Discussion = require("../../../../models/Discussion");

/**
 * Anonymise an account in place rather than deleting it.
 *
 * Preset.creator and FilmSim.creator are required references, and discussion
 * posts are embedded subdocuments carrying their author. A true cascade across
 * those ten collections would need a transaction, and this codebase has none —
 * a failure halfway through would leave dangling required refs and unreadable
 * threads. Tombstoning is atomic per document, keeps threads legible, and
 * removes the personal data it can reach.
 *
 * Deliberately NOT handled here:
 * - Cloudinary assets. Images are uploaded straight from the browser with an
 *   unsigned preset, so the server holds no admin credential to delete them
 *   with. Removing the Image documents would orphan the remote files instead of
 *   revoking them, so both are left in place. Tracked separately.
 *
 * Hard-deleted, because it is private and worthless to anyone else:
 * - Loadouts (the user's private camera state)
 * - Notifications addressed to them
 *
 * @param {import("mongoose").Document} user
 * @returns {Promise<{loadoutsDeleted: number, notificationsDeleted: number}>}
 */
const tombstoneAccount = async (user) => {
  const shortId = crypto.randomBytes(4).toString("hex");

  user.username = `deleted_user_${shortId}`;
  // Email is unique-indexed and required, so it cannot simply be unset.
  // A unique unroutable placeholder keeps the index happy and makes the row
  // useless for signing in or for matching against a real person.
  user.email = `deleted_${shortId}@deleted.invalid`;
  user.bio = undefined;
  user.avatar = undefined;
  user.instagram = undefined;
  user.cameras = [];
  user.primaryCamera = undefined;

  // Scramble rather than clear: password is required, and a random value no one
  // holds means no login path even if the tombstone is later un-marked.
  user.password = crypto.randomBytes(32).toString("hex");

  // Revoke every credential and outstanding session.
  user.verificationToken = undefined;
  user.tokenExpiry = undefined;
  user.resetTokenHash = undefined;
  user.resetTokenExpiry = undefined;
  // A staged email change holds a real address, so it is PII in its own right.
  user.pendingEmail = undefined;
  user.pendingEmailTokenHash = undefined;
  user.pendingEmailTokenExpiry = undefined;
  user.emailVerified = false;
  user.credentialsChangedAt = new Date();
  user.deletedAt = new Date();

  await user.save();

  const [loadouts, notifications, discussions] = await Promise.all([
    Loadout.deleteMany({ owner: user._id }),
    Notification.deleteMany({ recipientId: user._id }),
    scrubDiscussionIdentity(user._id, user.username),
  ]);

  return {
    loadoutsDeleted: loadouts?.deletedCount ?? 0,
    notificationsDeleted: notifications?.deletedCount ?? 0,
    discussionsScrubbed: discussions,
  };
};

/**
 * Discussion posts and replies store a COPY of the author's username and avatar
 * alongside the userId, so anonymising the User document alone leaves the real
 * name and avatar URL sitting in every thread. Unlike a plain reference (which
 * resolves to the tombstone), these have to be rewritten in place.
 *
 * @returns {Promise<number>} discussions touched
 */
const scrubDiscussionIdentity = async (userId, tombstoneUsername) => {
  // arrayFilters targets only this user's entries, leaving co-authors alone.
  const result = await Discussion.updateMany(
    {
      $or: [
        { "posts.userId": userId },
        { "posts.replies.userId": userId },
      ],
    },
    {
      $set: {
        "posts.$[post].username": tombstoneUsername,
        "posts.$[post].avatar": null,
        "posts.$[].replies.$[reply].username": tombstoneUsername,
        "posts.$[].replies.$[reply].avatar": null,
      },
    },
    {
      arrayFilters: [
        { "post.userId": userId },
        { "reply.userId": userId },
      ],
    }
  );

  return result?.modifiedCount ?? 0;
};

module.exports = { tombstoneAccount };
