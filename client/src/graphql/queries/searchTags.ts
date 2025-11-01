import { gql } from "@apollo/client";

export const SEARCH_TAGS = gql`
  query SearchTags($search: String, $category: String, $limit: Int) {
    searchTags(search: $search, category: $category, limit: $limit) {
      id
      name
      displayName
    }
  }
`;
