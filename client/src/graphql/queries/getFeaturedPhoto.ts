import { gql } from "@apollo/client";

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
