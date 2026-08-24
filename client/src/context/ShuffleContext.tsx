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
  const [shuffleCounter, setShuffleCounter] = useState(0);

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
