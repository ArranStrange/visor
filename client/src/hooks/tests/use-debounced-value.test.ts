/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  DEFAULT_DEBOUNCE_MS,
  useDebouncedValue,
} from "../useDebouncedValue";

// The debounce is what stops a server-side search from firing a request per
// keystroke — each distinct term is its own cache entry and its own round trip.

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("defaults to 300ms", () => {
    expect(DEFAULT_DEBOUNCE_MS).toBe(300);
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("portra"));
    expect(result.current).toBe("portra");
  });

  it("holds the old value until the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value),
      { initialProps: { value: "" } }
    );

    rerender({ value: "p" });
    act(() => void vi.advanceTimersByTime(299));
    expect(result.current).toBe("");

    act(() => void vi.advanceTimersByTime(1));
    expect(result.current).toBe("p");
  });

  it("emits only the last value of a burst of keystrokes", () => {
    // Typing "portra" one character at a time must produce one search, not
    // six — and certainly not six whose responses can arrive out of order.
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value),
      { initialProps: { value: "" } }
    );

    for (const value of ["p", "po", "por", "port", "portr", "portra"]) {
      rerender({ value });
      act(() => void vi.advanceTimersByTime(50));
    }

    expect(result.current).toBe("");

    act(() => void vi.advanceTimersByTime(DEFAULT_DEBOUNCE_MS));
    expect(result.current).toBe("portra");
  });

  it("honours a custom delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 1000),
      { initialProps: { value: "a" } }
    );

    rerender({ value: "b" });
    act(() => void vi.advanceTimersByTime(999));
    expect(result.current).toBe("a");

    act(() => void vi.advanceTimersByTime(1));
    expect(result.current).toBe("b");
  });

  it("clearing the box settles on the empty term", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value),
      { initialProps: { value: "portra" } }
    );

    rerender({ value: "" });
    act(() => void vi.advanceTimersByTime(DEFAULT_DEBOUNCE_MS));

    expect(result.current).toBe("");
  });
});
