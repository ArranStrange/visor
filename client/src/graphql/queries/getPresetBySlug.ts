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
        texture
        grain {
          amount
          size
          roughness
        }
        sharpening
        sharpenRadius
        sharpenDetail
        sharpenEdgeMasking
        luminanceSmoothing
        luminanceDetail
        luminanceContrast
        noiseReduction {
          luminance
          color
          detail
          colorSmoothness
        }
        colorAdjustments {
          red {
            hue
            saturation
            luminance
          }
          orange {
            hue
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
            luminance
          }
          aqua {
            hue
            saturation
            luminance
          }
          blue {
            hue
            saturation
            luminance
          }
          purple {
            hue
            saturation
            luminance
          }
          magenta {
            hue
            saturation
            luminance
          }
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
      beforeImage {
        id
        url
        publicId
      }
      afterImage {
        id
        url
        publicId
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
