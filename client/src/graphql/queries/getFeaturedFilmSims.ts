import { gql } from "@apollo/client";

export const GET_FEATURED_FILMSIMS = gql`
  query GetFeaturedFilmSims {
    featuredFilmSim: listFilmSims(filter: { featured: true }, limit: 100) {
      filmSims {
        id
        name
        slug
        description
        notes
        sampleImages {
          url
        }
        tags {
          id
          displayName
        }
        creator {
          id
          username
          avatar
        }
      }
    }
  }
`;
