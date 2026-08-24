import { gql } from "@apollo/client";

export const GET_FEATURED_ITEMS = gql`
  query GetFeaturedItems {
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
    featuredFilmSim: listFilmSims(filter: { featured: true }, limit: 100) {
      filmSims {
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

export const GET_FEATURED_PHOTO = gql`
  query GetFeaturedPhoto {
    getFeaturedPhoto {
      id
      url
      caption
      isFeaturedPhoto
      uploader {
        id
        username
      }
    }
  }
`;

export const MAKE_FEATURED_PHOTO = gql`
  mutation MakeFeaturedPhoto($imageId: ID!) {
    makeFeaturedPhoto(imageId: $imageId) {
      id
      url
      isFeaturedPhoto
    }
  }
`;

export const REMOVE_FEATURED_PHOTO = gql`
  mutation RemoveFeaturedPhoto($imageId: ID!) {
    removeFeaturedPhoto(imageId: $imageId) {
      id
      url
      isFeaturedPhoto
    }
  }
`;
