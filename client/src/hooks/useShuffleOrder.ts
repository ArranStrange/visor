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
  const shuffledIndices = useMemo(() => {
    if (!childrenLength) {
      return [];
    }

    const itemIndices = Array.from({ length: childrenLength }, (_, i) => i);

    if (randomizeOrder) {
      return [...itemIndices].sort(() => Math.random() - 0.5);
    }

    return itemIndices;
  }, [childrenLength, randomizeOrder, shuffleCounter]);

  return shuffledIndices;
};
