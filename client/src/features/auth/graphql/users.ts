import { gql } from "@apollo/client";
import type { FilmSimSummary, PresetSummary } from "@/types/graphql";

export interface UserUploadPreset extends PresetSummary {
  likes?: Array<{ id: string }>;
  downloads?: number;
  createdAt?: string;
}

export interface UserUploadFilmSim extends FilmSimSummary {
  likes?: Array<{ id: string }>;
  createdAt?: string;
}

export interface UserUploadsProfile {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
  instagram?: string;
  cameras?: string[];
  /** Canonical catalogue name of the body the app personalises for. */
  primaryCamera?: string | null;
  presets?: UserUploadPreset[];
  filmSims?: UserUploadFilmSim[];
}

export interface GetUserUploadsQueryData {
  getUser: UserUploadsProfile | null;
}

export interface GetUserUploadsQueryVariables {
  userId: string;
}

export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        username
        email
        avatar
        isAdmin
      }
    }
  }
`;

export const REGISTER_USER = gql`
  mutation RegisterUser(
    $username: String!
    $email: String!
    $password: String!
  ) {
    register(username: $username, email: $email, password: $password) {
      success
      message
      requiresVerification
      user {
        id
        username
        email
        avatar
        emailVerified
      }
    }
  }
`;

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      success
      message
      user {
        id
        username
        email
        avatar
        emailVerified
      }
    }
  }
`;

export const RESEND_VERIFICATION_EMAIL = gql`
  mutation ResendVerificationEmail($email: String!) {
    resendVerificationEmail(email: $email) {
      success
      message
    }
  }
`;

// GraphQL query to get user profile
export const GET_USER_PROFILE = gql`
  query GetUserProfile {
    getCurrentUser {
      id
      username
      email
      avatar
      bio
      instagram
      cameras
      primaryCamera
    }
  }
`;

// GraphQL mutation to update user profile
export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: JSON!) {
    updateProfile(input: $input) {
      id
      username
      email
      avatar
      bio
      instagram
      cameras
      primaryCamera
    }
  }
`;

// GraphQL mutation to upload avatar
export const UPLOAD_AVATAR = gql`
  mutation UploadAvatar($file: Upload!) {
    uploadAvatar(file: $file)
  }
`;

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
        beforeImage {
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
