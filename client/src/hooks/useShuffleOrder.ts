import { useMemo, useRef } from "react";

interface UseShuffleOrderProps {
  childrenLength: number;
  randomizeOrder: boolean;
  shuffleCounter: number;
}

/**
 * Seeded random number generator for stable shuffling
 * Same seed always produces the same "random" number
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Stable shuffle: uses seeded random based on index and shuffleCounter
 * This ensures the same item index always gets the same position,
 * preventing reordering when new items are added
 */
function stableShuffle(length: number, shuffleCounter: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);

  // Use seeded random based on index + shuffleCounter
  // This ensures same index always gets same position for same shuffleCounter
  return indices.sort((a, b) => {
    const seedA = (a + 1) * 1000 + shuffleCounter;
    const seedB = (b + 1) * 1000 + shuffleCounter;
    return seededRandom(seedA) - seededRandom(seedB);
  });
}

export const useShuffleOrder = ({
  childrenLength,
  randomizeOrder,
  shuffleCounter,
}: UseShuffleOrderProps) => {
  const shuffledIndices = useMemo(() => {
    if (!childrenLength) {
      return [];
    }

    const itemIndices = Array.from({ length: childrenLength }, (_, i) => i);

    if (randomizeOrder) {
      // Stable shuffle: uses seeded random based on index + shuffleCounter
      // Same index always gets same position for same shuffleCounter
      // This prevents reordering when new items are added
      return stableShuffle(childrenLength, shuffleCounter);
    }

    return itemIndices;
  }, [childrenLength, randomizeOrder, shuffleCounter]);

  return shuffledIndices;
};
