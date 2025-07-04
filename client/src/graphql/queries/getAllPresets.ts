// src/graphql/queries/getAllPresets.ts
import { gql } from "@apollo/client";

export const GET_ALL_PRESETS = gql`
  query ListPresets {
    listPresets {
      id
      title
      slug
      description
      notes
      tags {
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
    }
  }
`;
