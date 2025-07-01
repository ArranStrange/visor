import { gql } from "@apollo/client";

export const CREATE_TAG = gql`
  mutation CreateTag($input: CreateTagInput!) {
    createTag(input: $input) {
      id
      name
      displayName
    }
  }
`;

export const GET_TAGS = gql`
  query GetTags {
    getTags {
      id
      name
      displayName
    }
  }
`;
