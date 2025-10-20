import { gql } from "@apollo/client";

export const MAKE_PRESET_FEATURED = gql`
  mutation MakePresetFeatured($presetId: ID!) {
    makePresetFeatured(presetId: $presetId) {
      id
      title
      featured
    }
  }
`;

export const REMOVE_PRESET_FEATURED = gql`
  mutation RemovePresetFeatured($presetId: ID!) {
    removePresetFeatured(presetId: $presetId) {
      id
      title
      featured
    }
  }
`;
