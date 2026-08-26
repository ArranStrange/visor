import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import type { ContentSort } from "@/types/graphql";
import { DEFAULT_CONTENT_SORT } from "./content-sort";

interface ContentTypeContextType {
  contentType: "all" | "presets" | "films";
  setContentType: (type: "all" | "presets" | "films") => void;
  randomizeOrder: boolean;
  setRandomizeOrder: (randomize: boolean) => void;
  sort: ContentSort;
  setSort: (sort: ContentSort) => void;
}

const ContentTypeContext = createContext<ContentTypeContextType | undefined>(
  undefined
);

export const useContentType = () => {
  const context = useContext(ContentTypeContext);
  if (context === undefined) {
    throw new Error("useContentType must be used within a ContentTypeProvider");
  }
  return context;
};

interface ContentTypeProviderProps {
  children: ReactNode;
}

export const ContentTypeProvider: React.FC<ContentTypeProviderProps> = ({
  children,
}) => {
  const [contentType, setContentType] = useState<"all" | "presets" | "films">(
    "all"
  );
  const [randomizeOrder, setRandomizeOrderState] = useState(true);
  const [sort, setSortState] = useState<ContentSort>(DEFAULT_CONTENT_SORT);

  // Sorting and shuffling are mutually exclusive, and the exclusion lives here
  // rather than in the controls: the shuffle button and the sort control are
  // rendered in different places, and a rule enforced in two components is a
  // rule that eventually holds in one of them. Shuffling reorders whatever the
  // grid holds client-side, so leaving a server-side order selected alongside
  // it would show an ordering the label does not describe.
  const setSort = useCallback((next: ContentSort) => {
    setSortState(next);
    setRandomizeOrderState(false);
  }, []);

  const setRandomizeOrder = useCallback((randomize: boolean) => {
    setRandomizeOrderState(randomize);
    if (randomize) setSortState(DEFAULT_CONTENT_SORT);
  }, []);

  const value = useMemo(
    () => ({
      contentType,
      setContentType,
      randomizeOrder,
      setRandomizeOrder,
      sort,
      setSort,
    }),
    [contentType, randomizeOrder, setRandomizeOrder, sort, setSort]
  );

  return (
    <ContentTypeContext.Provider value={value}>
      {children}
    </ContentTypeContext.Provider>
  );
};
