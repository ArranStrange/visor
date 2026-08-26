const { targetUrl } = require("./services/reportTargets");
const { requireAdmin } = require("../../../utils/authHelpers");

const asIsoString = (value) => (value ? value.toISOString() : null);

module.exports = {
  Report: {
    // Dates are String in the schema, matching every other type here.
    createdAt: (report) => asIsoString(report.createdAt),
    updatedAt: (report) => asIsoString(report.updatedAt),
    resolvedAt: (report) => asIsoString(report.resolvedAt),

    // Gated on its own rather than relying on listReports being admin-only:
    // reportContent returns a Report to the reporter, so without this a
    // non-admin could select this field. Nothing it resolves today is private
    // (all content is public, and a reporter necessarily already found the
    // target), but a moderation-facing field defaulting to visible is the
    // wrong shape to leave behind for whenever private content does exist.
    //
    // One lookup per report, and only when the queue actually asks for it.
    targetUrl: (report, _args, context) => {
      requireAdmin(context?.user, "Admin access required");
      return targetUrl(report.targetType, report.targetId);
    },
  },
};
