const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * A user-filed report against a piece of content, and the moderation queue
 * built on top of it.
 *
 * Design decisions:
 *  - targetType + targetId rather than one ref per content type: the reportable
 *    surfaces (presets, film sims, images, discussion posts) live in four
 *    different collections, and a discussion post is a subdocument that no
 *    `ref` can point at. Resolvers verify the target exists before writing.
 *  - reason is a closed enum so the queue can be triaged without reading
 *    free text; detail is the optional "what exactly" and is length-capped so
 *    a report cannot be used as unbounded storage.
 *  - One OPEN report per reporter per target, enforced by the partial unique
 *    index below. The resolver returns the existing report instead of erroring:
 *    a second tap on Report is a user repeating themselves, not a failure, and
 *    duplicates would just inflate the queue.
 *  - resolvedBy/resolvedAt are set together when a report leaves OPEN, so the
 *    queue records who acted and when.
 */

const REPORT_TARGET_TYPES = [
  "PRESET",
  "FILMSIM",
  "IMAGE",
  "DISCUSSION_POST",
];

const REPORT_REASONS = [
  "SPAM",
  "STOLEN_CONTENT",
  "INAPPROPRIATE",
  "ABUSE",
  "OTHER",
];

const REPORT_STATUSES = ["OPEN", "ACTIONED", "DISMISSED"];

const DETAIL_MAX_LENGTH = 1000;

const reportSchema = new Schema(
  {
    reporter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: REPORT_TARGET_TYPES,
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    reason: {
      type: String,
      enum: REPORT_REASONS,
      required: true,
    },
    detail: {
      type: String,
      trim: true,
      maxlength: DETAIL_MAX_LENGTH,
      default: null,
    },
    status: {
      type: String,
      enum: REPORT_STATUSES,
      default: "OPEN",
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// The queue read: open reports, newest first.
reportSchema.index({ status: 1, createdAt: -1 });

// Backstop for the one-open-report-per-reporter-per-target rule. Only OPEN
// documents enter the index, so the same person can report a target again
// after an earlier report was actioned or dismissed.
reportSchema.index(
  { reporter: 1, targetType: 1, targetId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "OPEN" } }
);

// Finding every report against one piece of content, for the moderator
// looking at a target rather than at the queue.
reportSchema.index({ targetType: 1, targetId: 1 });

const Report = mongoose.model("Report", reportSchema);

Report.TARGET_TYPES = REPORT_TARGET_TYPES;
Report.REASONS = REPORT_REASONS;
Report.STATUSES = REPORT_STATUSES;
Report.DETAIL_MAX_LENGTH = DETAIL_MAX_LENGTH;

module.exports = Report;
