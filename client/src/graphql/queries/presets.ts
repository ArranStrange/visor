import { gql } from "@apollo/client";

query ListPresets {
  listPresets {
    id
    title
    slug
    tags {
      id
      name
      displayName
    }
    creator {
      id
      username
      avatar
    }
  }
}