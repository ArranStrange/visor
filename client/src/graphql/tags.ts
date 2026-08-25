import { gql } from "@apollo/client";
import type { TagSummary } from "../types/graphql";

export interface GetAllTagsQueryData {
  listTags?: Array<TagSummary | null> | null;
}

export const GET_ALL_TAGS = gql`
  query GetAllTags {
    listTags {
      id
      name
      displayName
    }
  }
`;

export const GET_ALL_TAGS_OPTIONS = {
  errorPolicy: "all" as const,
};

export const SEARCH_TAGS = gql`
  query SearchTags($search: String, $category: String, $limit: Int) {
    searchTags(search: $search, category: $category, limit: $limit) {
      id
      name
      displayName
    }
  }
`;

export const GET_TAGS = gql`
  query GetTags {
    getTags {
      id
      name
      displayName
    }
  }
`;
