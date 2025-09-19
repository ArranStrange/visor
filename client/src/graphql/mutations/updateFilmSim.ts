import { gql } from "@apollo/client";

export const UPDATE_FILMSIM = gql`
  mutation UpdateFilmSim($id: ID!, $input: JSON!) {
    updateFilmSim(id: $id, input: $input) {
      id
      name
      slug
      description
      type
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
        colorChromeEffect
        colorChromeFxBlue
      }
      compatibleCameras
      notes
      updatedAt
    }
  }
`;
