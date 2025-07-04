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
      notes
      creator {
        id
        username
        avatar
        instagram
      }
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
        filmSimulation
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
      comments {
        id
        content
        createdAt
        author {
          id
          username
          avatar
        }
      }
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
