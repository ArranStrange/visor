import { gql } from "@apollo/client";

export const SEARCH_PRESETS = gql`
  query SearchPresets($query: String!) {
    listPresets(filter: { title: $query }) {
      id
      title
      slug
      description
      afterImage {
        url
      }
      creator {
        id
        username
        avatar
      }
      tags {
        id
        displayName
      }
    }
  }
`;
