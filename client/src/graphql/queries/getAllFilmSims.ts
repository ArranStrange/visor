import { gql } from "@apollo/client";

export const GET_ALL_FILMSIMS = gql`
  query ListFilmSims {
    listFilmSims {
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
  }
`;
