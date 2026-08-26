// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import {
  ContentTypeProvider,
  useContentType,
} from "@/context/ContentTypeFilter";
import { DEFAULT_CONTENT_SORT } from "@/context/content-sort";
import type { ContentSort } from "@/types/graphql";

// Sorting and shuffling both claim to order the grid, and they are rendered in
// different components — the sort control and the shuffle button. The exclusion
// therefore lives in the context, and this is what pins it: if it drifted, the
// grid would show a shuffled order under a "Most downloaded" label.

function Probe() {
  const { sort, setSort, randomizeOrder, setRandomizeOrder } = useContentType();

  return (
    <div>
      <output data-testid="sort">{sort}</output>
      <output data-testid="randomize">{String(randomizeOrder)}</output>
      {(
        ["NEWEST", "POPULAR", "MOST_DOWNLOADED", "MOST_SAVED"] as ContentSort[]
      ).map((value) => (
        <button key={value} onClick={() => setSort(value)}>
          {`sort-${value}`}
        </button>
      ))}
      <button onClick={() => setRandomizeOrder(true)}>shuffle-on</button>
      <button onClick={() => setRandomizeOrder(false)}>shuffle-off</button>
    </div>
  );
}

const renderProbe = () =>
  render(
    <ContentTypeProvider>
      <Probe />
    </ContentTypeProvider>
  );

const sort = () => screen.getByTestId("sort").textContent;
const randomize = () => screen.getByTestId("randomize").textContent;
const press = (label: string) => fireEvent.click(screen.getByText(label));

describe("ContentTypeFilter sort state", () => {
  afterEach(cleanup);

  it("starts on the default sort", () => {
    renderProbe();

    expect(DEFAULT_CONTENT_SORT).toBe("NEWEST");
    expect(sort()).toBe("NEWEST");
  });

  it("keeps shuffle on by default, as before", () => {
    renderProbe();
    expect(randomize()).toBe("true");
  });

  it("holds each of the four orders", () => {
    renderProbe();

    for (const value of [
      "POPULAR",
      "MOST_DOWNLOADED",
      "MOST_SAVED",
      "NEWEST",
    ]) {
      press(`sort-${value}`);
      expect(sort()).toBe(value);
    }
  });

  it("turns shuffle off when an order is chosen", () => {
    renderProbe();
    expect(randomize()).toBe("true");

    press("sort-POPULAR");

    expect(randomize()).toBe("false");
    expect(sort()).toBe("POPULAR");
  });

  it("resets the order to the default when shuffle is switched on", () => {
    renderProbe();

    press("sort-MOST_SAVED");
    expect(sort()).toBe("MOST_SAVED");

    press("shuffle-on");

    expect(sort()).toBe("NEWEST");
    expect(randomize()).toBe("true");
  });

  it("switching shuffle off does not disturb the chosen order", () => {
    // Turning shuffle off is not a request to reorder — the sort the user
    // picked (which turned shuffle off in the first place) must stand.
    renderProbe();

    press("sort-POPULAR");
    press("shuffle-off");

    expect(sort()).toBe("POPULAR");
    expect(randomize()).toBe("false");
  });

  it("never has both a non-default order and shuffle active", () => {
    renderProbe();

    for (const step of [
      "sort-POPULAR",
      "shuffle-on",
      "sort-MOST_DOWNLOADED",
      "shuffle-on",
      "sort-MOST_SAVED",
    ]) {
      press(step);
      expect(sort() === "NEWEST" || randomize() === "false").toBe(true);
    }
  });
});
