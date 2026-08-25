import { useMemo } from "react";

interface UseShuffleOrderProps {
  childrenLength: number;
  randomizeOrder: boolean;
  shuffleCounter: number;
}

export const useShuffleOrder = ({
  childrenLength,
  randomizeOrder,
  shuffleCounter,
}: UseShuffleOrderProps) => {
  const shuffledIndices = useMemo(
    () =>
      createShuffleOrder(childrenLength, randomizeOrder, shuffleCounter),
    [childrenLength, randomizeOrder, shuffleCounter]
  );

  return shuffledIndices;
};

export function createShuffleOrder(
  childrenLength: number,
  randomizeOrder: boolean,
  shuffleCounter: number
) {
  if (!childrenLength) {
    return [];
  }

  const itemIndices = Array.from({ length: childrenLength }, (_, i) => i);

  if (randomizeOrder) {
    return shuffle(itemIndices, shuffleCounter);
  }

  return itemIndices;
}

function shuffle(itemIndices: number[], seed: number) {
  const shuffledIndices = [...itemIndices];
  const random = createSeededRandom(seed);

  for (let index = shuffledIndices.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [shuffledIndices[index], shuffledIndices[randomIndex]] = [
      shuffledIndices[randomIndex],
      shuffledIndices[index],
    ];
  }

  return shuffledIndices;
}

function createSeededRandom(seed: number) {
  let state = seed;

  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
