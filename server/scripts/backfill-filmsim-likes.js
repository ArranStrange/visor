/**
 * Backfill FilmSim.likes from the legacy numeric field (#128).
 *
 * FilmSim.likes was declared `{ type: Number, default: 0 }` while the GraphQL
 * schema advertised `likes: [User]`. Nothing selected the field on a list
 * query, so the mismatch never surfaced as the "Expected Iterable" error it
 * would otherwise have thrown — and `likeFilmSim` was declared in the schema
 * with no resolver behind it, so the number never moved off zero either.
 *
 * The decision this script encodes: a count cannot be converted back into a
 * list of users, so the old value is PRESERVED as `likeCount` and `likes[]`
 * starts empty. That means a user who liked a film sim before the fix will not
 * see their own like reflected in the button state, but no count is lost. The
 * alternative — discarding the number — would have silently reset every
 * film sim's popularity.
 *
 * Safety properties (same shape as backfill-compatible-sensors.js):
 *  - Dry run is the DEFAULT. Pass --write to actually update documents.
 *  - Idempotent: only documents whose `likes` is still a BSON number are
 *    touched, so a second run selects nothing.
 *  - Counts and a sample are logged before anything is written.
 *  - Reads and writes go through the raw driver collection, not the Mongoose
 *    model: the model now casts `likes` to an array, which would either drop
 *    or fail on the legacy numeric value.
 *
 * Usage:
 *   node server/scripts/backfill-filmsim-likes.js            # dry run
 *   node server/scripts/backfill-filmsim-likes.js --write    # apply
 */

const mongoose = require("mongoose");
const config = require("../config");
const FilmSim = require("../models/FilmSim");

const SAMPLE_SIZE = 5;

/** Documents still holding the legacy numeric likes value. */
const PENDING_QUERY = { likes: { $type: "number" } };

/**
 * The update for one legacy document: the number becomes likeCount, the array
 * starts empty. Negative, fractional and non-finite values are floored to 0
 * rather than written through — a count is a non-negative integer, and a bad
 * value in the old field should not become a bad value in the new one.
 */
const plannedUpdateFor = (doc) => {
  const legacy = doc?.likes;
  const count =
    typeof legacy === "number" && Number.isFinite(legacy) && legacy > 0
      ? Math.floor(legacy)
      : 0;

  return { likes: [], likeCount: count };
};

const run = async () => {
  const write = process.argv.includes("--write");
  const mode = write ? "WRITE" : "DRY RUN";

  if (!config.MONGO_URI) {
    throw new Error("MONGODB_URI is not set");
  }

  await mongoose.connect(config.MONGO_URI);
  const collection = FilmSim.collection;

  try {
    const total = await collection.countDocuments({});
    const candidates = await collection
      .find(PENDING_QUERY, { projection: { _id: 1, slug: 1, likes: 1 } })
      .toArray();

    console.log(`[backfill-filmsim-likes] mode: ${mode}`);
    console.log(`  film sims total ............ ${total}`);
    console.log(`  legacy numeric likes ....... ${candidates.length}`);

    const planned = candidates.map((doc) => ({
      doc,
      update: plannedUpdateFor(doc),
    }));
    const carryingACount = planned.filter(
      ({ update }) => update.likeCount > 0
    ).length;

    console.log(`  will update ................ ${planned.length}`);
    console.log(`  of those, non-zero counts .. ${carryingACount}`);

    for (const { doc, update } of planned.slice(0, SAMPLE_SIZE)) {
      console.log(
        `    ${doc.slug ?? doc._id}: likes ${JSON.stringify(doc.likes)} -> likeCount ${update.likeCount}, likes []`
      );
    }
    if (planned.length > SAMPLE_SIZE) {
      console.log(`    … and ${planned.length - SAMPLE_SIZE} more`);
    }

    if (!write) {
      console.log(
        "[backfill-filmsim-likes] dry run — nothing written. Re-run with --write to apply."
      );
      return;
    }

    let updated = 0;
    for (const { doc, update } of planned) {
      const result = await collection.updateOne(
        // Re-assert the precondition so a concurrent write can't be clobbered.
        { _id: doc._id, likes: { $type: "number" } },
        { $set: update }
      );
      updated += result.modifiedCount ?? 0;
    }

    console.log(`[backfill-filmsim-likes] updated ${updated} film sims.`);
    console.log(
      `  remaining pending .......... ${await collection.countDocuments(PENDING_QUERY)}`
    );
  } finally {
    await mongoose.disconnect();
  }
};

if (require.main === module) {
  run().catch((error) => {
    console.error("[backfill-filmsim-likes] failed", error);
    process.exitCode = 1;
  });
}

module.exports = { plannedUpdateFor, PENDING_QUERY };
