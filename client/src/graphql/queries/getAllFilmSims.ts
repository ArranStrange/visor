import { gql } from "@apollo/client";

export const GET_ALL_FILMSIMS = gql`
  query ListFilmSims {
    listFilmSims {
      id
      name
      slug
      description
      tags {
        displayName
      }
      creator {
        username
        avatar
      }
      sampleImages {
        url
      }
      toneProfile
    }
  }
`;
