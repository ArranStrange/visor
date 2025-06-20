import { gql } from "@apollo/client";

export const DELETE_PRESET = gql`
  mutation DeletePreset($id: ID!) {
    deletePreset(id: $id)
  }
`;
