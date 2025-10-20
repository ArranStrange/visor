import { gql } from "@apollo/client";

export const LIST_PRESETS = gql`
  query ListPresets($page: Int, $limit: Int, $filter: JSON) {
    listPresets(page: $page, limit: $limit, filter: $filter) {
      presets {
        id
        title
        slug
        afterImage
        tags {
          id
          name
          displayName
        }
        creator {
          id
          username
          avatar
        }
      }
      totalCount
      hasNextPage
      hasPreviousPage
      currentPage
      totalPages
    }
  }
`;
