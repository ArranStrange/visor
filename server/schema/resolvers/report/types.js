const { targetUrl } = require("./services/reportTargets");

const asIsoString = (value) => (value ? value.toISOString() : null);

module.exports = {
  Report: {
    // Dates are String in the schema, matching every other type here.
    createdAt: (report) => asIsoString(report.createdAt),
    updatedAt: (report) => asIsoString(report.updatedAt),
    resolvedAt: (report) => asIsoString(report.resolvedAt),
    // One lookup per report, and only when the queue actually asks for it.
    targetUrl: (report) => targetUrl(report.targetType, report.targetId),
  },
};
