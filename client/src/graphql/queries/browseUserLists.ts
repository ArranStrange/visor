import { gql } from "@apollo/client";

export const BROWSE_USER_LISTS = gql`
  query BrowseUserLists($search: String, $page: Int, $limit: Int) {
    browseUserLists(search: $search, page: $page, limit: $limit) {
      lists {
        id
        name
        description
        isPublic
        isFeatured
        createdAt
        updatedAt
        owner {
          id
          username
          avatar
        }
        presets {
          id
          title
          slug
          afterImage {
            id
            url
          }
          tags {
            id
            name
            displayName
          }
        }
        filmSims {
          id
          name
          slug
          sampleImages {
            id
            url
          }
        }
      }
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
`;
