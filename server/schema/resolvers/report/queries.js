const Report = require("../../../models/Report");
const { requireAdmin } = require("../../../utils/authHelpers");
const { clampPagination } = require("../../../utils/pagination");

module.exports = {
  listReports: async (_, { status, page, limit }, context) => {
    requireAdmin(context.user);

    const pagination = clampPagination(page, limit);
    // No status means the open queue: that is what a moderator opens the page
    // to see, and an unfiltered list would bury it under resolved history.
    const query = { status: status || "OPEN" };

    const [reports, totalCount] = await Promise.all([
      Report.find(query)
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .populate("reporter", "username avatar")
        .populate("resolvedBy", "username"),
      Report.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / pagination.limit);

    return {
      reports,
      totalCount,
      currentPage: pagination.page,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPreviousPage: pagination.page > 1,
    };
  },
};
