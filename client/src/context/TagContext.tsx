import React, { createContext, useContext, useState, useCallback } from "react";
import { useLazyQuery } from "@apollo/client";
import { SEARCH_TAGS } from "../graphql/queries/searchTags";

export interface Tag {
  id: string;
  name: string;
  displayName: string;
}

interface TagContextType {
  tags: Tag[];
  loading: boolean;
  error: Error | undefined;
  searchTags: (search?: string, category?: string, limit?: number) => void;
  clearTags: () => void;
}

const TagContext = createContext<TagContextType | undefined>(undefined);

export const TagProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchTagsQuery, { loading, error }] = useLazyQuery(SEARCH_TAGS, {
    onCompleted: (data) => {
      // Only store tags that exist in DB with valid data
      const validTags = (data?.searchTags || []).filter(
        (tag: Tag) =>
          tag &&
          tag.id &&
          typeof tag.id === "string" &&
          tag.id.trim().length > 0 &&
          tag.displayName &&
          typeof tag.displayName === "string" &&
          tag.displayName.trim().length > 0 &&
          tag.name &&
          typeof tag.name === "string" &&
          tag.name.trim().length > 0
      );
      setTags(validTags);
    },
    fetchPolicy: "cache-and-network",
  });

  const searchTags = useCallback(
    (search?: string, category?: string, limit?: number) => {
      searchTagsQuery({
        variables: {
          search: search || undefined,
          category: category || undefined,
          limit: limit || undefined,
        },
      });
    },
    [searchTagsQuery]
  );

  const clearTags = useCallback(() => {
    setTags([]);
  }, []);

  return (
    <TagContext.Provider
      value={{
        tags,
        loading,
        error: error as Error | undefined,
        searchTags,
        clearTags,
      }}
    >
      {children}
    </TagContext.Provider>
  );
};

export const useTags = (): TagContextType => {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error("useTags must be used within a TagProvider");
  }
  return context;
};
