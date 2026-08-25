import { describe, expect, it } from "vitest";
import { createShuffleOrder } from "@/hooks/useShuffleOrder";

describe("useShuffleOrder", () => {
  it("returns the same order for the same seed", () => {
    const firstOrder = createOrder(12, 42);
    const secondOrder = createOrder(12, 42);

    expect(secondOrder).toEqual(firstOrder);
  });

  it("returns different orders for known different seeds", () => {
    expect(createOrder(12, 1)).not.toEqual(createOrder(12, 2));
  });

  it("returns a permutation of every item index", () => {
    expect([...createOrder(12, 42)].sort((a, b) => a - b)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ]);
  });
});

function createOrder(childrenLength: number, shuffleCounter: number) {
  return createShuffleOrder(childrenLength, true, shuffleCounter);
}
