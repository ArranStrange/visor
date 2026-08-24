const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Clamp page/limit query args to sane bounds and derive the skip offset.
 * Guards against page=0/negative and unbounded/negative limits reaching
 * Mongoose's .skip()/.limit() directly.
 */
const clampPagination = (
  page,
  limit,
  { defaultLimit = DEFAULT_LIMIT, maxLimit = MAX_LIMIT } = {}
) => {
  const numericPage = Number(page);
  const safePage =
    Number.isFinite(numericPage) && numericPage > 0 ? Math.floor(numericPage) : 1;

  const numericLimit = Number(limit);
  const rawLimit = Number.isFinite(numericLimit) ? Math.floor(numericLimit) : defaultLimit;
  const safeLimit = Math.min(Math.max(rawLimit, 1), maxLimit);

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
};

module.exports = { clampPagination };
