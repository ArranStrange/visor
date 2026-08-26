/**
 * Backfill the denormalised discovery counters on Preset and FilmSim.
 *
 * `likeCount`, `saveCount` and `popularityScore` are maintained by $inc from
 * now on, but existing documents have never had them written: every one of
 * them would sort as zero. This script derives them from the data that does
 * exist and writes them once.
 *
 * What each counter is derived from:
 *  - Preset.likeCount  = likes.length. The array is real for presets.
 *  - FilmSim.likeCount is NOT touched. FilmSim.likes[] is empty by design
 *    after scripts/backfill-filmsim-likes.js, which parked the legacy numeric
 *    value in likeCount; recomputing from the array would zero it. Run that
 *    script first.
 *  - saveCount = the number of UserLists holding the id.
 *  - popularityScore = the ratified weights in utils/popularity.js, applied to
 *    the counters above plus the existing `downloads`.
 *
 * Safety properties:
 *  - Dry run is the DEFAULT. Pass --write to actually update documents.
 *  - Idempotent: the derived values are recomputed from source data every run
 *    and only written where they differ, so a second run reports zero changes.
 *  - Counts and a sample are logged before anything is written.
 *
 * Usage:
 *   node server/scripts/backfill-content-counters.js            # dry run
 *   node server/scripts/backfill-content-counters.js --write    # apply
 */

const mongoose = require("mongoose");
const config = require("../config");
const Preset = require("../models/Preset");
const FilmSim = require("../models/FilmSim");
const UserList = require("../models/UserList");
const { popularityScoreFor, asCount } = require("../utils/popularity");

const SAMPLE_SIZE = 5;

/**
 * The counter values one document should hold, and whether they differ from
 * what it holds now. `likeCountFrom` is null for film sims, whose likeCount is
 * owned by the legacy-likes backfill and must be left as it is.
 */
const plannedCountersFor = (doc, saveCount, { likeCountFrom }) => {
  const likeCount =
    likeCountFrom === "array"
      ? (doc.likes ?? []).length
      : asCount(doc.likeCount);

  const target = {
    likeCount,
    saveCount,
    popularityScore: popularityScoreFor({
      downloads: doc.downloads,
      saveCount,
      likeCount,
    }),
  };

  const changed = Object.entries(target).some(
    ([key, value]) => asCount(doc[key]) !== value
  );

  return { target, changed };
};

/** id -> number of UserLists holding it, for one membership field. */
const saveCountsById = async (field) => {
  const rows = await UserList.aggregate([
    { $unwind: `$${field}` },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
  ]);

  return new Map(rows.map((row) => [String(row._id), row.count]));
};

const backfillModel = async ({ model, label, membershipField, likeCountFrom, write }) => {
  const saveCounts = await saveCountsById(membershipField);
  const docs = await model
    .find({})
    .select("_id slug likes likeCount saveCount downloads popularityScore")
    .lean();

  const planned = [];
  for (const doc of docs) {
    const saveCount = saveCounts.get(String(doc._id)) ?? 0;
    const { target, changed } = plannedCountersFor(doc, saveCount, {
      likeCountFrom,
    });
    if (changed) planned.push({ doc, target });
  }

  console.log(`  ${label}`);
  console.log(`    documents ............... ${docs.length}`);
  console.log(`    saved in a list ......... ${saveCounts.size}`);
  console.log(`    needing an update ....... ${planned.length}`);

  for (const { doc, target } of planned.slice(0, SAMPLE_SIZE)) {
    console.log(
      `      ${doc.slug ?? doc._id}: likeCount ${target.likeCount}, saveCount ${target.saveCount}, popularityScore ${target.popularityScore}`
    );
  }
  if (planned.length > SAMPLE_SIZE) {
    console.log(`      … and ${planned.length - SAMPLE_SIZE} more`);
  }

  if (!write) return 0;

  let updated = 0;
  for (const { doc, target } of planned) {
    const result = await model.updateOne({ _id: doc._id }, { $set: target });
    updated += result.modifiedCount ?? 0;
  }
  console.log(`    updated ................. ${updated}`);
  return updated;
};

const run = async () => {
  const write = process.argv.includes("--write");
  const mode = write ? "WRITE" : "DRY RUN";

  if (!config.MONGO_URI) {
    throw new Error("MONGODB_URI is not set");
  }

  await mongoose.connect(config.MONGO_URI);

  try {
    console.log(`[backfill-content-counters] mode: ${mode}`);

    await backfillModel({
      model: Preset,
      label: "presets",
      membershipField: "presets",
      likeCountFrom: "array",
      write,
    });
    await backfillModel({
      model: FilmSim,
      label: "film sims (likeCount left to backfill-filmsim-likes)",
      membershipField: "filmSims",
      likeCountFrom: "existing",
      write,
    });

    if (!write) {
      console.log(
        "[backfill-content-counters] dry run — nothing written. Re-run with --write to apply."
      );
    }
  } finally {
    await mongoose.disconnect();
  }
};

if (require.main === module) {
  run().catch((error) => {
    console.error("[backfill-content-counters] failed", error);
    process.exitCode = 1;
  });
}

module.exports = { plannedCountersFor };
