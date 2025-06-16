import { useQuery, gql } from "@apollo/client";

const GET_TAG = gql`
  query GetTag($id: ID!) {
    getTag(id: $id) {
      id
      name
      displayName
    }
  }
`;

export function useTag(id: string | undefined) {
  return useQuery(GET_TAG, { variables: { id }, skip: !id });
}
