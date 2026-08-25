import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";

interface UsePresetSearchResult {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  shouldShowResults: boolean;
}

export const usePresetSearch = (): UsePresetSearchResult => {
  const [searchQuery, setSearchQuery] = useState("");

  return {
    searchQuery,
    setSearchQuery,
    shouldShowResults: searchQuery.trim().length >= 2,
  };
};
