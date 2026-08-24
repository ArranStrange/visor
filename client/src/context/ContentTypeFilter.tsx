import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

interface ContentTypeContextType {
  contentType: "all" | "presets" | "films";
  setContentType: (type: "all" | "presets" | "films") => void;
  randomizeOrder: boolean;
  setRandomizeOrder: (randomize: boolean) => void;
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
  const [randomizeOrder, setRandomizeOrder] = useState(true);

  const value = useMemo(
    () => ({
      contentType,
      setContentType,
      randomizeOrder,
      setRandomizeOrder,
    }),
    [contentType, randomizeOrder]
  );

  return (
    <ContentTypeContext.Provider value={value}>
      {children}
    </ContentTypeContext.Provider>
  );
};
