/**
 * Escapes regular-expression metacharacters in user-supplied search input so
 * it can be embedded in a RegExp (or a Mongo `$regex`) as a literal string.
 *
 * Without this, a search for "(" throws, and inputs like ".*" or nested
 * quantifiers turn a search into an expensive scan.
 *
 * @param {unknown} input value to escape
 * @returns {string} the escaped string, or "" for null/undefined
 */
const escapeRegExp = (input) => {
  if (input === null || input === undefined) return "";

  return String(input).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

module.exports = { escapeRegExp };
