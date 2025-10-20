import { gql } from "@apollo/client";

export const GET_ALL_FILMSIMS = gql`
  query ListFilmSims($page: Int, $limit: Int, $filter: JSON) {
    listFilmSims(page: $page, limit: $limit, filter: $filter) {
      filmSims {
        id
        name
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
        sampleImages {
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
