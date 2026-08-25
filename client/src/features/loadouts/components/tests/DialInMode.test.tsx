// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  cleanup,
} from "@testing-library/react";
import DialInMode from "@/features/loadouts/components/DialInMode";
import { buildDialInSteps } from "@/features/loadouts/utils/dialIn";
import type { LoadoutSlot } from "@/features/loadouts/types/loadouts";

const slotAt = (index: number, name = "Everyday Chrome"): LoadoutSlot => ({
  index,
  filmSim: {
    id: `sim-${index}`,
    name,
    slug: "everyday-chrome",
    settings: {
      filmSimulation: "CLASSIC CHROME",
      dynamicRange: 400,
      highlight: -1,
      shadow: 2,
      color: 0,
      sharpness: -2,
      noiseReduction: -4,
      grainEffect: "Weak",
      clarity: -3,
      whiteBalance: "daylight",
      wbShift: { r: 3, b: -2 },
      colorChromeEffect: "Strong",
      colorChromeFxBlue: "Weak",
    },
  },
  filmSimName: name,
  note: null,
  sourceChanged: false,
});

const renderPlayer = (overrides: Partial<React.ComponentProps<typeof DialInMode>> = {}) => {
  const props = {
    open: true,
    slot: slotAt(0),
    cameraKey: "xt5",
    cameraName: "X-T5",
    nextSlotIndex: null as number | null,
    onClose: vi.fn(),
    onNextSlot: vi.fn(),
    onMarkKeyedIn: vi.fn(),
    ...overrides,
  };
  const utils = render(<DialInMode {...props} />);
  return { ...utils, props };
};

const dialog = () => screen.getByRole("dialog");
const advanceToDone = () => {
  // Derive the step count rather than hardcode it, so a change to the
  // step builder doesn't silently strand this helper mid-flow.
  const total = buildDialInSteps(
    slotAt(0).filmSim!.settings!,
    "xt5",
    1
  ).steps.length;
  for (let i = 0; i < total - 1; i++) {
    fireEvent.click(screen.getByRole("button", { name: /set — next/i }));
  }
  fireEvent.click(screen.getByRole("button", { name: /^done$/i }));
};

// Vitest runs without globals here, so RTL's automatic cleanup never
// registers — without this, dialogs accumulate across tests and every
// text query finds multiples.
afterEach(cleanup);

beforeEach(() => {
  // No wakeLock in jsdom's navigator by default — individual tests that
  // care define their own mock.
  Object.defineProperty(navigator, "wakeLock", {
    configurable: true,
    value: undefined,
  });
});

describe("DialInMode", () => {
  it("plays step 0 (enter the bank) with the edit-in-bank path", () => {
    renderPlayer();
    expect(screen.getByText("Open the bank")).toBeTruthy();
    expect(screen.getByText(/EDIT\/SAVE CUSTOM SETTING › C1/)).toBeTruthy();
    expect(screen.getByText(/Step 1 of 13/)).toBeTruthy();
  });

  it("arrow keys advance and retreat; Back is disabled at step 0", () => {
    renderPlayer();
    const back = screen.getByRole("button", { name: /back/i });
    expect(back.hasAttribute("disabled")).toBe(true);

    fireEvent.keyDown(dialog(), { key: "ArrowRight" });
    expect(screen.getByText(/Step 2 of 13/)).toBeTruthy();
    fireEvent.keyDown(dialog(), { key: "ArrowLeft" });
    expect(screen.getByText(/Step 1 of 13/)).toBeTruthy();
    fireEvent.keyDown(dialog(), { key: "ArrowLeft" }); // retreat at 0 stays
    expect(screen.getByText(/Step 1 of 13/)).toBeTruthy();
  });

  it("Enter advances mid-flow, but defers to a focused control", () => {
    renderPlayer();
    fireEvent.keyDown(dialog(), { key: "Enter" });
    expect(screen.getByText(/Step 2 of 13/)).toBeTruthy();

    // Enter targeted at a button must NOT also advance the step.
    const closeButton = screen.getByRole("button", { name: /exit dial-in/i });
    fireEvent.keyDown(closeButton, { key: "Enter" });
    expect(screen.getByText(/Step 2 of 13/)).toBeTruthy();
  });

  it("the done screen offers keyed-in on the last bank, focused for Enter", () => {
    const { props } = renderPlayer({ nextSlotIndex: null });
    advanceToDone();
    const mark = screen.getByRole("button", { name: /mark loadout as keyed in/i });
    expect(document.activeElement).toBe(mark);

    // Enter no longer advances anything on the done screen (done guard),
    // and clicking the focused action fires the callbacks.
    fireEvent.keyDown(dialog(), { key: "Enter" });
    fireEvent.click(mark);
    expect(props.onMarkKeyedIn).toHaveBeenCalledOnce();
    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it("the done screen chains explicitly to the next filled bank", () => {
    const { props } = renderPlayer({ nextSlotIndex: 4 });
    advanceToDone();
    fireEvent.click(screen.getByRole("button", { name: /next: c5/i }));
    expect(props.onNextSlot).toHaveBeenCalledWith(4);
    expect(props.onMarkKeyedIn).not.toHaveBeenCalled();
  });

  it("chaining to a new slot renders its step 0 immediately — no stale done flash", () => {
    const { rerender, props } = renderPlayer({ nextSlotIndex: 4 });
    advanceToDone();
    expect(screen.getByRole("heading", { name: "C1 done" })).toBeTruthy();

    rerender(
      <DialInMode {...props} slot={slotAt(4, "Blue Hour")} nextSlotIndex={null} />
    );
    expect(screen.queryByText(/done/i)).toBeNull();
    expect(screen.getByText(/Step 1 of 13/)).toBeTruthy();
    expect(screen.getByText(/C5 · BLUE HOUR/)).toBeTruthy();
  });

  it("Escape opens confirm-exit preserving the step; Keep going returns; a second Escape backs out", () => {
    const { props } = renderPlayer();
    fireEvent.keyDown(dialog(), { key: "ArrowRight" });
    fireEvent.keyDown(dialog(), { key: "ArrowRight" });

    fireEvent.keyDown(dialog(), { key: "Escape" });
    expect(screen.getByText("Exit dial-in?")).toBeTruthy();
    expect(props.onClose).not.toHaveBeenCalled();

    // Second Escape = safe default: back to the flow, same step.
    fireEvent.keyDown(dialog(), { key: "Escape" });
    expect(screen.queryByText("Exit dial-in?")).toBeNull();
    expect(screen.getByText(/Step 3 of 13/)).toBeTruthy();

    // Explicit exit works.
    fireEvent.keyDown(dialog(), { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: /^exit$/i }));
    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it("confirm screen focuses Keep going (the safe default)", () => {
    renderPlayer();
    fireEvent.keyDown(dialog(), { key: "Escape" });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: /keep going/i })
    );
  });

  it("releases a wake lock that resolves only after close (acquire/close race)", async () => {
    const release = vi.fn().mockResolvedValue(undefined);
    let resolveLock: (v: { release: typeof release }) => void = () => {};
    Object.defineProperty(navigator, "wakeLock", {
      configurable: true,
      value: {
        request: () =>
          new Promise((resolve) => {
            resolveLock = resolve;
          }),
      },
    });

    const { unmount } = renderPlayer();
    unmount(); // close before the lock resolves
    await act(async () => {
      resolveLock({ release });
      await Promise.resolve();
    });
    expect(release).toHaveBeenCalled();
  });
});
