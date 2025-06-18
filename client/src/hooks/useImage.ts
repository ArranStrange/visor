import { useQuery, gql } from "@apollo/client";

const GET_IMAGE = gql`
  query GetImage($id: ID!) {
    getImage(id: $id) {
      id
      url
      caption
    }
  }
`;

export function useImage(id: string | undefined) {
  return useQuery(GET_IMAGE, { variables: { id }, skip: !id });
}
