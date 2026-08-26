const mongoose = require("mongoose");

const Report = require("../../../models/Report");
const { requireAdmin, requireAuth } = require("../../../utils/authHelpers");
const { UserInputError, ValidationError } = require("../../../utils/errors");
const { createLogger } = require("../../../utils/logger");
const {
  enforceRateLimit,
  REPORT_LIMIT,
} = require("../../../utils/mutationRateLimits");
const { targetExists } = require("./services/reportTargets");

const logger = createLogger("resolvers:report");

const populated = (query) =>
  query.populate("reporter", "username avatar").populate("resolvedBy", "username");

module.exports = {
  reportContent: async (_, { targetType, targetId, reason, detail }, context) => {
    const user = requireAuth(
      context.user,
      "You must be logged in to report content"
    );

    // Keyed per reporter, not just per IP: the point is that one account
    // cannot flood the queue, and a shared IP must not punish everyone behind
    // it for one bad actor.
    enforceRateLimit("report-content", context.req, REPORT_LIMIT, user.id);

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      throw new ValidationError("That content could not be found");
    }

    const exists = await targetExists(targetType, targetId);
    if (!exists) {
      // Deliberately the same message as an invalid id: a report form must not
      // become a way to probe which ids exist.
      throw new ValidationError("That content could not be found");
    }

    const trimmedDetail = detail?.trim() ? detail.trim() : null;
    if (trimmedDetail && trimmedDetail.length > Report.DETAIL_MAX_LENGTH) {
      throw new ValidationError(
        `Please keep the details under ${Report.DETAIL_MAX_LENGTH} characters`
      );
    }

    const duplicateQuery = {
      reporter: user.id,
      targetType,
      targetId,
      status: "OPEN",
    };

    // Idempotent: a second tap on Report is someone repeating themselves, not
    // an error worth showing them, and duplicates only inflate the queue.
    const existing = await populated(Report.findOne(duplicateQuery));
    if (existing) {
      return existing;
    }

    try {
      const report = await Report.create({
        reporter: user.id,
        targetType,
        targetId,
        reason,
        detail: trimmedDetail,
      });

      return await populated(Report.findById(report._id));
    } catch (error) {
      // The partial unique index is the backstop for two reports racing; treat
      // the loser exactly like the duplicate branch above.
      if (error.code === 11000) {
        return await populated(Report.findOne(duplicateQuery));
      }
      logger.error("Failed to file report", error);
      throw error;
    }
  },

  resolveReport: async (_, { reportId, status }, context) => {
    const admin = requireAdmin(context.user);

    if (status === "OPEN") {
      throw new UserInputError(
        "A report can only be resolved as ACTIONED or DISMISSED"
      );
    }

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      throw new ValidationError("Report not found");
    }

    const report = await Report.findByIdAndUpdate(
      reportId,
      { $set: { status, resolvedBy: admin.id, resolvedAt: new Date() } },
      { new: true }
    );

    if (!report) {
      throw new ValidationError("Report not found");
    }

    return await populated(Report.findById(report._id));
  },
};
