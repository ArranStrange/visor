import { gql } from "@apollo/client";

export const GET_FILMSIM_BY_SLUG = gql`
  query GetFilmSim($slug: String!) {
    getFilmSim(slug: $slug) {
      id
      name
      slug
      description
      type
      compatibleCameras
      settings {
        dynamicRange
        highlight
        shadow
        colour
        sharpness
        noiseReduction
        grainEffect
        clarity
        whiteBalance
        wbShift {
          r
          b
        }
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
      recommendedPresets {
        id
        title
        slug
        description
        thumbnail
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
  }
`;
