import { gql } from "@apollo/client";

export const DELETE_FILMSIM = gql`
  mutation DeleteFilmSim($id: ID!) {
    deleteFilmSim(id: $id)
  }
`;
