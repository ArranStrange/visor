import { gql } from "@apollo/client";

export const GET_FEATURED_ITEMS = gql`
  query GetFeaturedItems {
    featuredPreset: listPresets(filter: { featured: true }) {
      id
      title
      slug
      description
      notes
      afterImage {
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
    featuredFilmSim: listFilmSims(filter: { featured: true }) {
      id
      name
      slug
      description
      notes
      sampleImages {
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
    featuredUserLists {
      id
      name
      description
      isFeatured
      owner {
        id
        username
        avatar
      }
      presets {
        id
        title
        slug
        afterImage {
          url
        }
      }
      filmSims {
        id
        name
        slug
        sampleImages {
          url
        }
      }
    }
  }
`;
