/**
 * The popularity weights ratified as Q3 in docs/plans/c1-c3-delivery-plan.md:
 * a download counts for three, a save for two, a like for one.
 *
 * `popularityScore` is denormalised on Preset and FilmSim and maintained by
 * $inc at each mutation, never computed per query — a POPULAR sort has to be
 * able to use an index. This module is the single place the weights live, so
 * the mutations that $inc and the backfill that recomputes cannot disagree.
 *
 * Deliberately not time-decayed: the enum value is POPULAR and the UI label is
 * "Popular", not "Trending", so nothing promises a velocity algorithm.
 */

const POPULARITY_WEIGHTS = Object.freeze({
  download: 3,
  save: 2,
  like: 1,
});

const asCount = (value) =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;

/** Recompute a score from scratch. Used by the backfill, not by the hot path. */
const popularityScoreFor = ({ downloads, saveCount, likeCount } = {}) =>
  asCount(downloads) * POPULARITY_WEIGHTS.download +
  asCount(saveCount) * POPULARITY_WEIGHTS.save +
  asCount(likeCount) * POPULARITY_WEIGHTS.like;

module.exports = { POPULARITY_WEIGHTS, popularityScoreFor, asCount };
