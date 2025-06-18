import { gql } from "@apollo/client";

export const LIST_PRESETS = gql`
  query ListPresets {
    listPresets {
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
  }
`;
