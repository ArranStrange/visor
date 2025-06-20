import { gql } from "@apollo/client";

export const GET_USER_UPLOADS = gql`
  query GetUserUploads($userId: ID!) {
    getUser(id: $userId) {
      id
      username
      avatar
      bio
      instagram
      cameras
      presets {
        id
        title
        slug
        description
        tags {
          id
          name
          displayName
        }
        afterImage {
          url
        }
        likes {
          id
        }
        downloads
        createdAt
      }
      filmSims {
        id
        name
        slug
        description
        tags {
          id
          name
          displayName
        }
        sampleImages {
          url
          caption
        }
        likes {
          id
        }
        createdAt
      }
    }
  }
`;
