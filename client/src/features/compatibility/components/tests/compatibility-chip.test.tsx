// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import CompatibilityChip from "../CompatibilityChip";

const mockCamera = vi.hoisted(() => ({ cameraKey: null as string | null }));

vi.mock("@/context/CameraContext", () => ({
  useCamera: () => mockCamera,
}));

afterEach(() => {
  cleanup();
  mockCamera.cameraKey = null;
});

const status = () =>
  screen.getByTestId("compatibility-chip").getAttribute("data-status");

describe("CompatibilityChip", () => {
  it("renders nothing when no camera is set", () => {
    render(<CompatibilityChip settings={{ clarity: -2 }} />);

    // An "unchecked" chip on every card would be noise, not information.
    expect(screen.queryByTestId("compatibility-chip")).toBeNull();
  });

  it("renders the unverified state when explicitly asked to", () => {
    render(<CompatibilityChip settings={{ clarity: -2 }} showUnverified />);

    expect(status()).toBe("UNVERIFIED");
    expect(screen.getByText("Not checked")).toBeTruthy();
  });

  it("labels a recipe the body can fully shoot", () => {
    mockCamera.cameraKey = "xt5";
    render(
      <CompatibilityChip
        settings={{ clarity: -2, filmSimulation: "CLASSIC CHROME" }}
        compatibleSensors={["X-Trans V"]}
      />
    );

    expect(status()).toBe("FITS");
    expect(screen.getByText("Fits your camera")).toBeTruthy();
  });

  it("labels settings the body can't apply", () => {
    mockCamera.cameraKey = "xt2";
    render(<CompatibilityChip settings={{ clarity: -2 }} />);

    expect(status()).toBe("PARTIAL");
    expect(screen.getByText("Partly fits")).toBeTruthy();
  });

  it("labels a film simulation the body doesn't have", () => {
    mockCamera.cameraKey = "xt2";
    render(<CompatibilityChip settings={{ filmSimulation: "CLASSIC NEG" }} />);

    expect(status()).toBe("INCOMPATIBLE");
    expect(screen.getByText("Not on your camera")).toBeTruthy();
  });

  it("labels a recipe written for another generation", () => {
    mockCamera.cameraKey = "xt5";
    render(
      <CompatibilityChip
        settings={{ filmSimulation: "CLASSIC CHROME" }}
        compatibleSensors={["GFX"]}
      />
    );

    expect(status()).toBe("FITS_WITH_SUBSTITUTIONS");
    expect(screen.getByText("Fits, with tweaks")).toBeTruthy();
  });
});
