import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

interface ShuffleContextType {
  shuffleCounter: number;
  triggerShuffle: () => void;
}

const ShuffleContext = createContext<ShuffleContextType | undefined>(
  undefined
);

export const useShuffle = () => {
  const context = useContext(ShuffleContext);
  if (context === undefined) {
    throw new Error("useShuffle must be used within a ShuffleProvider");
  }
  return context;
};

interface ShuffleProviderProps {
  children: ReactNode;
}

export const ShuffleProvider: React.FC<ShuffleProviderProps> = ({
  children,
}) => {
  // Lazy-init a random starting seed so each visit gets a fresh order;
  // the shuffle itself stays a pure function of the counter.
  const [shuffleCounter, setShuffleCounter] = useState(() =>
    Math.floor(Math.random() * 2 ** 31)
  );

  const triggerShuffle = useCallback(() => {
    setShuffleCounter((prev) => prev + 1);
  }, []);

  const value = useMemo(
    () => ({ shuffleCounter, triggerShuffle }),
    [shuffleCounter, triggerShuffle]
  );

  return (
    <ShuffleContext.Provider value={value}>{children}</ShuffleContext.Provider>
  );
};
