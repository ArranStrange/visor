import { useEffect, useState } from "react";

export const DEFAULT_DEBOUNCE_MS = 300;

/**
 * Trails `value` by `delay` milliseconds, resetting the timer on every change.
 *
 * Search is server-side, so the raw keystroke value cannot go straight into the
 * query variables: each distinct term is its own Apollo cache entry and its own
 * round trip, which would mean a request per character and results arriving out
 * of order behind a fast typist.
 *
 * The input itself stays bound to the undebounced state so typing never feels
 * laggy — only the fetch waits.
 */
export function useDebouncedValue<T>(
  value: T,
  delay: number = DEFAULT_DEBOUNCE_MS
): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // A zero delay still goes through a timer rather than setting state
    // synchronously, so the hook's behaviour does not change shape when a
    // caller disables the debounce.
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
