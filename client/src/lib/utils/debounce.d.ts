export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait?: number,
  options?: { maxWait?: number }
): T & { flush: () => void; cancel: () => void };
