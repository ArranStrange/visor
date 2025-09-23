import { useState, useMemo } from "react";

interface Preset {
  id: string;
  title: string;
  description?: string;
  afterImage?: { url: string };
  creator?: { id: string; username: string; avatar?: string };
  tags?: Array<{ displayName: string; id?: string }>;
}

interface UsePresetSearchProps {
  allPresets: Preset[];
  currentRecommendedPresets: Preset[];
}

export const usePresetSearch = ({
  allPresets,
  currentRecommendedPresets,
}: UsePresetSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];

    const searchTerm = searchQuery.toLowerCase();
    return allPresets.filter((preset) => {
      const searchableText = [
        preset.title,
        preset.description,
        preset.creator?.username,
        ...(preset.tags?.map((tag) => tag?.displayName || "") || []),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchTerm);
    });
  }, [allPresets, searchQuery]);

  const availableResults = useMemo(() => {
    const currentIds = new Set(currentRecommendedPresets.map((p) => p.id));
    return searchResults.filter((preset) => !currentIds.has(preset.id));
  }, [searchResults, currentRecommendedPresets]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults: availableResults,
    hasResults: availableResults.length > 0,
    shouldShowResults: searchQuery.length >= 2,
  };
};
