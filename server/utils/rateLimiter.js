// In-memory sliding-window rate limiter for abuse-prone mutations.
//
// SINGLE INSTANCE ONLY. Counters live in this process's heap, so they reset on
// deploy and are not shared between instances. The server currently runs as one
// Render instance, which makes this worth having and honest about its limit: if
// the service is ever scaled out, this needs to move to a shared store.
//
// Deliberately not a dependency: the whole thing is a Map of timestamps.

const buckets = new Map();

// Stop the Map growing without bound when keys are never seen again.
const PRUNE_EVERY = 500;
let writesSincePrune = 0;

const pruneExpired = (now) => {
  for (const [key, entry] of buckets) {
    if (entry.windowMs === undefined) continue;
    const newest = entry.hits[entry.hits.length - 1];
    if (newest === undefined || now - newest > entry.windowMs) {
      buckets.delete(key);
    }
  }
};

/**
 * Records an attempt and reports whether it should be allowed.
 *
 * @returns {{allowed: boolean, remaining: number, retryAfterSeconds: number}}
 */
const consume = (key, { limit, windowMs, now = Date.now() } = {}) => {
  if (!key) throw new Error("rate limiter requires a key");
  if (!limit || !windowMs) throw new Error("rate limiter requires limit and windowMs");

  writesSincePrune += 1;
  if (writesSincePrune >= PRUNE_EVERY) {
    writesSincePrune = 0;
    pruneExpired(now);
  }

  const entry = buckets.get(key) || { hits: [], windowMs };
  entry.windowMs = windowMs;

  // Sliding window: drop anything that has aged out before counting.
  const cutoff = now - windowMs;
  entry.hits = entry.hits.filter((at) => at > cutoff);

  if (entry.hits.length >= limit) {
    buckets.set(key, entry);
    const oldest = entry.hits[0];
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  entry.hits.push(now);
  buckets.set(key, entry);

  return {
    allowed: true,
    remaining: limit - entry.hits.length,
    retryAfterSeconds: 0,
  };
};

// Successful flows call this so a legitimate user is not punished for, say,
// mistyping a password twice before getting it right.
const reset = (key) => {
  buckets.delete(key);
};

// Test seam only.
const clearAll = () => {
  buckets.clear();
  writesSincePrune = 0;
};

module.exports = { consume, reset, clearAll };
