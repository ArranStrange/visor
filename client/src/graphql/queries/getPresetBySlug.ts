import { gql } from "@apollo/client";

export const GET_PRESET_BY_SLUG = gql`
  query GetPreset($slug: String!) {
    getPreset(slug: $slug) {
      id
      title
      slug
      description
      xmpUrl
      settings {
        exposure
        contrast
        highlights
        shadows
        whites
        blacks
        clarity
        vibrance
        saturation
        temp
        tint
        dehaze
        grain {
          amount
          size
          roughness
        }
        sharpening
        noiseReduction {
          luminance
          color
          detail
        }
      }
      toneCurve {
        rgb {
          x
          y
        }
        red {
          x
          y
        }
        green {
          x
          y
        }
        blue {
          x
          y
        }
      }
      notes
      creator {
        id
        username
        avatar
        instagram
      }
      tags {
        id
        name
        displayName
      }
      sampleImages {
        id
        url
        caption
      }
      likes {
        id
      }
      downloads
      createdAt
    }
  }
`;
