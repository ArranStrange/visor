// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import { visorTheme } from "../../../theme/VISORTheme";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CardShell from "../CardShell";

const { navigateMock, mobileState } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  mobileState: { current: false },
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
}));

vi.mock("../../../hooks/useMobileDetection", () => ({
  useMobileDetection: () => mobileState.current,
}));

describe("CardShell", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    navigateMock.mockReset();
    mobileState.current = false;
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("navigates on the first desktop click", () => {
    renderShell();

    clickCard();

    expect(navigateMock).toHaveBeenCalledWith("/preset/example");
  });

  it("reveals options on the first mobile tap and navigates on the second", () => {
    mobileState.current = true;
    renderShell();

    clickCard();

    expect(getMediaState("options")).toBe("true");
    expect(navigateMock).not.toHaveBeenCalled();

    clickCard();

    expect(navigateMock).toHaveBeenCalledWith("/preset/example");
  });

  it("supports cards that navigate on the first mobile tap", () => {
    mobileState.current = true;
    renderShell({ revealOnMobileTap: false });

    clickCard();

    expect(navigateMock).toHaveBeenCalledWith("/preset/example");
  });

  it("does not reveal or navigate while navigation is blocked", () => {
    mobileState.current = true;
    renderShell({ navigationBlocked: true });

    clickCard();

    expect(getMediaState("options")).toBe("false");
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("passes hover state to the media render slot", () => {
    renderShell();

    mouseEvent("mouseover");
    expect(getMediaState("hovered")).toBe("true");

    mouseEvent("mouseout");
    expect(getMediaState("hovered")).toBe("false");
  });

  it("can reveal options on hover without changing the default", () => {
    renderShell({ revealOptionsOnHover: true });

    mouseEvent("mouseover");
    expect(getMediaState("options")).toBe("true");

    mouseEvent("mouseout");
    expect(getMediaState("options")).toBe("false");
  });

  function renderShell(
    props: {
      revealOnMobileTap?: boolean;
      revealOptionsOnHover?: boolean;
      navigationBlocked?: boolean;
    } = {}
  ) {
    act(() => {
      root.render(
        // CardShell reads VISOR-only palette slots (surface, overlay),
        // so it must render under the app theme.
        React.createElement(
          ThemeProvider,
          { theme: visorTheme },
          React.createElement(
            CardShell,
            {
              aspectRatio: "4/5",
              navigateTo: "/preset/example",
              renderMedia: ({ isHovered, showOptions }) =>
                React.createElement("span", {
                  "data-testid": "media-state",
                  "data-hovered": isHovered,
                  "data-options": showOptions,
                }),
              ...props,
            },
            React.createElement("span", null, "Overlay")
          )
        )
      );
    });
  }

  function clickCard() {
    mouseEvent("click");
  }

  function mouseEvent(type: string) {
    const card = container.querySelector(".MuiCard-root");
    if (!card) throw new Error("CardShell did not render a Card");
    act(() => card.dispatchEvent(new MouseEvent(type, { bubbles: true })));
  }

  function getMediaState(name: "hovered" | "options") {
    return container
      .querySelector('[data-testid="media-state"]')
      ?.getAttribute(`data-${name}`);
  }
});
