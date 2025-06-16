import { useQuery, gql } from "@apollo/client";

const GET_USER = gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      avatar
    }
  }
`;

export function useUser(id: string | undefined) {
  return useQuery(GET_USER, { variables: { id }, skip: !id });
}
