// src/graphql/queries/getAllTags.ts
import { gql } from "@apollo/client";

export const GET_ALL_TAGS = gql`
  query GetAllTags {
    listTags {
      id
      name
      displayName
      category
    }
  }
`;
