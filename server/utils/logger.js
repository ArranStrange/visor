/**
 * Minimal namespaced logger. No dependencies.
 *
 * createLogger("area") returns { info, warn, error }, each prefixing
 * output with "[area]" and delegating to the matching console method.
 */
function createLogger(namespace) {
  const prefix = `[${namespace}]`;

  return {
    info(message) {
      console.log(prefix, message);
    },
    warn(message) {
      console.warn(prefix, message);
    },
    error(message, error) {
      if (error instanceof Error) {
        console.error(prefix, message, error.message, error.stack);
      } else if (error !== undefined) {
        console.error(prefix, message, error);
      } else {
        console.error(prefix, message);
      }
    },
  };
}

module.exports = { createLogger };
