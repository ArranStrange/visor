// src/graphql/queries/getAllPresets.ts
import { gql } from "@apollo/client";

export const GET_ALL_PRESETS = gql`
  query ListPresets($page: Int, $limit: Int, $filter: JSON) {
    listPresets(page: $page, limit: $limit, filter: $filter) {
      presets {
        id
        title
        slug
        description
        notes
        tags {
          id
          displayName
        }
        creator {
          id
          username
          avatar
        }
        afterImage {
          url
        }
        featured
      }
      totalCount
      hasNextPage
      hasPreviousPage
      currentPage
      totalPages
    }
  }
`;
