import { gql } from "@apollo/client";

export const REMOVE_RECOMMENDED_PRESET = gql`
  mutation RemoveRecommendedPreset($filmSimId: ID!, $presetId: ID!) {
    removeRecommendedPreset(filmSimId: $filmSimId, presetId: $presetId) {
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
