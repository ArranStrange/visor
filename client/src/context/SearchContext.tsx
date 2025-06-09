// src/context/SearchContext.tsx

import React, { createContext, useContext, useState } from "react";

type SearchContextType = {
  activeTag: string | null;
  keyword: string;
  showAll: boolean;
  setActiveTag: (tag: string | null) => void;
  setKeyword: (kw: string) => void;
  setShowAll: (show: boolean) => void;
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [showAll, setShowAll] = useState(false);

  return (
    <SearchContext.Provider
      value={{
        activeTag,
        keyword,
        showAll,
        setActiveTag,
        setKeyword,
        setShowAll,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
