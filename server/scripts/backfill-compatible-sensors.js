/**
 * Backfill FilmSim.compatibleSensors from the deprecated compatibleCameras.
 *
 * compatibleCameras was renamed to compatibleSensors; despite the old name it
 * always held sensor generation LABELS ("X-Trans III"), so the migration is a
 * copy, not a translation. Documents written before the rename still carry
 * their values in the old field, and resolvers/filmSim/types.js falls back to
 * it at read time — this script moves the data so the fallback can be deleted
 * next release, and so raw Mongo filters (the sensorKey list filter) see the
 * same documents the resolver does.
 *
 * Safety properties:
 *  - Dry run is the DEFAULT. Pass --write to actually update documents.
 *  - Idempotent: only documents with a non-empty compatibleCameras and an
 *    empty/absent compatibleSensors are touched, so a second run is a no-op.
 *  - Counts and a sample are logged before anything is written.
 *  - Values not in the sensor catalogue are reported and skipped rather than
 *    copied, so a stray camera name in the legacy field can't become a sensor.
 *
 * Usage:
 *   node server/scripts/backfill-compatible-sensors.js            # dry run
 *   node server/scripts/backfill-compatible-sensors.js --write    # apply
 */

const mongoose = require("mongoose");
const config = require("../config");
const FilmSim = require("../models/FilmSim");
const { SENSOR_LABELS_BY_KEY } = require("../constants/fujifilmCameras");

const KNOWN_SENSOR_LABELS = new Set(Object.values(SENSOR_LABELS_BY_KEY));
const SAMPLE_SIZE = 5;

/** Documents the fallback resolver is currently reading from the old field. */
const PENDING_QUERY = {
  compatibleCameras: { $exists: true, $ne: [] },
  compatibleSensors: { $in: [null, []] },
};

/**
 * Sensor labels to write for one document: the legacy values, de-duplicated,
 * with anything outside the catalogue dropped.
 */
const sensorsFor = (legacyValues) => {
  const known = [];
  const unknown = [];

  for (const value of legacyValues ?? []) {
    const label = typeof value === "string" ? value.trim() : "";
    if (!label) continue;
    if (!KNOWN_SENSOR_LABELS.has(label)) {
      unknown.push(label);
      continue;
    }
    if (!known.includes(label)) known.push(label);
  }

  return { known, unknown };
};

const run = async () => {
  const write = process.argv.includes("--write");
  const mode = write ? "WRITE" : "DRY RUN";

  if (!config.MONGO_URI) {
    throw new Error("MONGODB_URI is not set");
  }

  await mongoose.connect(config.MONGO_URI);

  try {
    const total = await FilmSim.countDocuments({});
    const alreadyMigrated = await FilmSim.countDocuments({
      compatibleSensors: { $exists: true, $ne: [] },
    });
    const candidates = await FilmSim.find(PENDING_QUERY)
      .select("_id name slug compatibleCameras compatibleSensors")
      .lean();

    console.log(`[backfill-compatible-sensors] mode: ${mode}`);
    console.log(`  film sims total ............ ${total}`);
    console.log(`  already on compatibleSensors ${alreadyMigrated}`);
    console.log(`  pending backfill ........... ${candidates.length}`);

    const planned = [];
    const skipped = [];

    for (const doc of candidates) {
      const { known, unknown } = sensorsFor(doc.compatibleCameras);
      if (unknown.length) {
        console.warn(
          `  ! ${doc.slug ?? doc._id}: unrecognised legacy values ${JSON.stringify(unknown)}`
        );
      }
      if (!known.length) {
        skipped.push(doc);
        continue;
      }
      planned.push({ doc, sensors: known });
    }

    console.log(`  will update ................ ${planned.length}`);
    console.log(`  skipped (nothing usable) ... ${skipped.length}`);

    for (const { doc, sensors } of planned.slice(0, SAMPLE_SIZE)) {
      console.log(
        `    ${doc.slug ?? doc._id}: ${JSON.stringify(doc.compatibleCameras)} -> ${JSON.stringify(sensors)}`
      );
    }
    if (planned.length > SAMPLE_SIZE) {
      console.log(`    … and ${planned.length - SAMPLE_SIZE} more`);
    }

    if (!write) {
      console.log(
        "[backfill-compatible-sensors] dry run — nothing written. Re-run with --write to apply."
      );
      return;
    }

    let updated = 0;
    for (const { doc, sensors } of planned) {
      const result = await FilmSim.updateOne(
        // Re-assert the precondition so a concurrent write can't be clobbered.
        { _id: doc._id, compatibleSensors: { $in: [null, []] } },
        { $set: { compatibleSensors: sensors } }
      );
      updated += result.modifiedCount ?? 0;
    }

    console.log(`[backfill-compatible-sensors] updated ${updated} film sims.`);
    console.log(
      `  remaining pending .......... ${await FilmSim.countDocuments(PENDING_QUERY)}`
    );
  } finally {
    await mongoose.disconnect();
  }
};

if (require.main === module) {
  run().catch((error) => {
    console.error("[backfill-compatible-sensors] failed", error);
    process.exitCode = 1;
  });
}

module.exports = { sensorsFor, PENDING_QUERY };
