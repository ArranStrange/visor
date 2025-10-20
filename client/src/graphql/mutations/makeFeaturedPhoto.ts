import { gql } from "@apollo/client";

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
