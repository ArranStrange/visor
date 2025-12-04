/**
 * Debounces the execution of a function
 * @param {function} fn - the function to debounce
 * @param {number} wait - the amount of time to wait
 * @param options
 * @returns {function} the debounced function
 */
export function debounce(fn, wait = 0, { maxWait = 1000 * 60 * 60 * 2 } = {}) {
  let timer = 0;
  let startTime = Date.now();
  let running = false;
  let pendingParams;
  const result = function perform(...params) {
    pendingParams = params;
    if (running && Date.now() - startTime > maxWait) {
      execute();
      return;
    }
    if (!running) {
      startTime = Date.now();
    }
    running = true;

    clearTimeout(timer);
    const ms = Math.min(maxWait - (Date.now() - startTime), wait);
    timer = setTimeout(execute, ms);

    function execute() {
      running = false;
      fn(...params);
    }
  };
  result.flush = function flush() {
    if (running) {
      running = false;
      clearTimeout(timer);
      fn(...pendingParams);
    }
  };
  result.cancel = function cancel() {
    running = false;
    clearTimeout(timer);
  };
  return result;
}
