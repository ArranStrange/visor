import { gql } from "@apollo/client";

export const MAKE_FILMSIM_FEATURED = gql`
  mutation MakeFilmSimFeatured($filmSimId: ID!) {
    makeFilmSimFeatured(filmSimId: $filmSimId) {
      id
      name
      featured
    }
  }
`;

export const REMOVE_FILMSIM_FEATURED = gql`
  mutation RemoveFilmSimFeatured($filmSimId: ID!) {
    removeFilmSimFeatured(filmSimId: $filmSimId) {
      id
      name
      featured
    }
  }
`;
