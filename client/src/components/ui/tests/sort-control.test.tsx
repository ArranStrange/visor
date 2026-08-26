// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ContentTypeProvider } from "@/context/ContentTypeFilter";
import SortControl from "../SortControl";

const renderControl = () =>
  render(
    <ContentTypeProvider>
      <SortControl />
    </ContentTypeProvider>
  );

const openMenu = () => fireEvent.mouseDown(screen.getByRole("combobox"));

describe("SortControl", () => {
  afterEach(cleanup);

  it("offers the four orders, labelled Popular rather than Trending", () => {
    // Ratified as Q3: the score behind POPULAR has no time decay, so a
    // "Trending" label would promise recency the server does not provide.
    renderControl();
    openMenu();

    const labels = screen
      .getAllByRole("option")
      .map((option) => option.textContent);

    expect(labels).toEqual([
      "Newest",
      "Popular",
      "Most downloaded",
      "Most saved",
    ]);
    expect(labels).not.toContain("Trending");
  });

  it("starts on Newest", () => {
    renderControl();
    expect(screen.getByRole("combobox").textContent).toBe("Newest");
  });

  it("selecting an order updates the control", () => {
    renderControl();
    openMenu();

    fireEvent.click(screen.getByRole("option", { name: "Most downloaded" }));

    expect(screen.getByRole("combobox").textContent).toBe("Most downloaded");
  });
});
