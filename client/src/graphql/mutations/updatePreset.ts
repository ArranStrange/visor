import { gql } from "@apollo/client";

export const UPDATE_PRESET = gql`
  mutation UpdatePreset($id: ID!, $input: UpdatePresetInput!) {
    updatePreset(id: $id, input: $input) {
      id
      title
      slug
      description
      notes
      settings {
        exposure
        contrast
        highlights
        shadows
        whites
        blacks
        temp
        tint
        vibrance
        saturation
        clarity
        dehaze
        grain {
          amount
          size
          roughness
        }
        vignette {
          amount
        }
        colorAdjustments {
          red {
            hue
            saturation
            luminance
          }
          orange {
            saturation
            luminance
          }
          yellow {
            hue
            saturation
            luminance
          }
          green {
            hue
            saturation
          }
          blue {
            hue
            saturation
          }
        }
        splitToning {
          shadowHue
          shadowSaturation
          highlightHue
          highlightSaturation
          balance
        }
        sharpening
        noiseReduction {
          luminance
          detail
          color
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
      tags {
        id
        name
        displayName
      }
      creator {
        id
        username
        avatar
        instagram
      }
      xmpUrl
      likes {
        id
      }
      downloads
      createdAt
      updatedAt
    }
  }
`;
