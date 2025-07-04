import { gql } from "@apollo/client";

export const ADD_RECOMMENDED_PRESET = gql`
  mutation AddRecommendedPreset($filmSimId: ID!, $presetId: ID!) {
    addRecommendedPreset(filmSimId: $filmSimId, presetId: $presetId) {
      id
      name
      slug
      description
      recommendedPresets {
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
  }
`;
