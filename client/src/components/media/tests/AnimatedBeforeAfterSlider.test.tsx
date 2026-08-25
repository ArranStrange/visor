// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import AnimatedBeforeAfterSlider from "@/components/media/AnimatedBeforeAfterSlider";
import { visorTheme } from "@/theme/VISORTheme";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const slider = (isHovered: boolean, isMobile = false) => (
  // The component reads VISOR's custom overlay palette; the default MUI
  // theme lacks it, so render under the real theme.
  <ThemeProvider theme={visorTheme}>
    <AnimatedBeforeAfterSlider
      beforeImage="https://example.com/before.jpg"
      afterImage="https://example.com/after.jpg"
      isHovered={isHovered}
      isMobile={isMobile}
    />
  </ThemeProvider>
);

const renderSlider = (isHovered: boolean, isMobile = false) =>
  render(slider(isHovered, isMobile));

const loadImages = () => {
  fireEvent.load(screen.getByAltText("After"));
  fireEvent.load(screen.getByAltText("Before"));
};

const beforeClip = () =>
  (screen.getByAltText("Before") as HTMLElement).style.clipPath;

describe("AnimatedBeforeAfterSlider", () => {
  it("defers the before image entirely until the first hover", () => {
    // Regression for the lazy-load deadlock: a native-lazy image that is
    // fully clipped never loads in Chromium, so the reveal never armed.
    // The fix mounts it eagerly on first hover instead.
    const { rerender } = renderSlider(false);
    expect(screen.queryByAltText("Before")).toBeNull();

    rerender(slider(true));
    const before = screen.getByAltText("Before") as HTMLImageElement;
    expect(before.getAttribute("loading")).toBe("eager");
    // ...and it stays mounted after unhover, so the fetch happens once.
    rerender(slider(false));
    expect(screen.getByAltText("Before")).toBeTruthy();
  });

  it("sweeps to the before image on hover once both images load", () => {
    const { rerender } = renderSlider(false);
    rerender(slider(true));
    loadImages();
    expect(beforeClip()).toBe("inset(0 0% 0 0)");
  });

  it("stays inert until images are ready", () => {
    renderSlider(true);
    // Hovered, but no load events yet: no reveal.
    expect(beforeClip()).toBe("inset(0 100% 0 0)");
  });

  it("treats already-complete (cached) images as loaded without onLoad", () => {
    // The original bug: cached images never fire React's onLoad, so the
    // slider stayed dead on exactly those cards. Simulate the cached
    // state the callback ref sees at attach time.
    Object.defineProperty(HTMLImageElement.prototype, "complete", {
      configurable: true,
      get: () => true,
    });
    Object.defineProperty(HTMLImageElement.prototype, "naturalWidth", {
      configurable: true,
      get: () => 800,
    });
    try {
      renderSlider(true);
      // No fireEvent.load anywhere — the ref check alone must arm it.
      expect(beforeClip()).toBe("inset(0 0% 0 0)");
    } finally {
      delete (HTMLImageElement.prototype as { complete?: unknown }).complete;
      delete (HTMLImageElement.prototype as { naturalWidth?: unknown })
        .naturalWidth;
    }
  });

  it("loops the peek while hovered instead of dead-ending after one sweep", () => {
    vi.useFakeTimers();
    renderSlider(true);
    act(() => loadImages());
    expect(beforeClip()).toBe("inset(0 0% 0 0)"); // sweep out

    act(() => vi.advanceTimersByTime(800)); // ANIMATION + DISPLAY
    expect(beforeClip()).toBe("inset(0 100% 0 0)"); // sweep back

    act(() => vi.advanceTimersByTime(1400)); // return + rest → next cycle
    expect(beforeClip()).toBe("inset(0 0% 0 0)"); // loops
  });

  it("resets and stops the loop on unhover", () => {
    vi.useFakeTimers();
    const { rerender } = renderSlider(true);
    act(() => loadImages());

    rerender(slider(false));
    expect(beforeClip()).toBe("inset(0 100% 0 0)");
    act(() => vi.advanceTimersByTime(5000));
    expect(beforeClip()).toBe("inset(0 100% 0 0)"); // no zombie timers
  });

  it("mobile: the first-tap reveal peeks once and stops — no endless loop", () => {
    // On mobile isHovered never falls (tap-to-reveal has no leave event),
    // so a looping sweep would run forever while the user scrolls.
    vi.useFakeTimers();
    renderSlider(true, true);
    act(() => loadImages());
    expect(beforeClip()).toBe("inset(0 0% 0 0)"); // peek

    act(() => vi.advanceTimersByTime(800)); // sweep back
    expect(beforeClip()).toBe("inset(0 100% 0 0)");

    act(() => vi.advanceTimersByTime(10000)); // ...and stays back
    expect(beforeClip()).toBe("inset(0 100% 0 0)");
  });

  it("a broken before image disables the reveal instead of waiting forever", () => {
    renderSlider(true);
    fireEvent.load(screen.getByAltText("After"));
    fireEvent.error(screen.getByAltText("Before"));
    expect(beforeClip()).toBe("inset(0 100% 0 0)");
  });

  it("holds the comparison statically under prefers-reduced-motion", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    }));
    renderSlider(true);
    act(() => loadImages());
    const img = screen.getByAltText("Before") as HTMLElement;
    expect(img.style.clipPath).toBe("inset(0 0% 0 0)");
    expect(img.style.transition).toBe("none");
  });
});
