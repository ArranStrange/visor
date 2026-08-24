import { useState } from "react";

export const usePresetSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return {
    searchQuery,
    setSearchQuery,
    shouldShowResults: searchQuery.trim().length >= 2,
  };
};
