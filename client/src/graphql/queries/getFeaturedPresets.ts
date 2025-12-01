import { gql } from "@apollo/client";

export const GET_FEATURED_PRESETS = gql`
  query GetFeaturedPresets {
    featuredPreset: listPresets(filter: { featured: true }, limit: 100) {
      presets {
        id
        title
        slug
        description
        notes
        afterImage {
          url
        }
        beforeImage {
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
