import { gql } from "@apollo/client";
import type {
  FilmSimSummary,
  ImageSummary,
  PresetSummary,
  UserSummary,
} from "../types/graphql";
import type { UserList } from "@/features/lists/types/lists";

export interface FeaturedPreset extends PresetSummary {
  notes?: string;
  creator: UserSummary;
}

export interface FeaturedFilmSim extends FilmSimSummary {
  notes?: string;
  creator: UserSummary;
}

export type FeaturedUserList = Pick<
  UserList,
  "id" | "name" | "description" | "presets" | "filmSims"
> & {
  isFeatured?: boolean;
  owner: UserSummary;
};

export interface GetFeaturedItemsQueryData {
  featuredPreset?: { presets: FeaturedPreset[] } | null;
  featuredFilmSim?: { filmSims: FeaturedFilmSim[] } | null;
  featuredUserLists?: FeaturedUserList[] | null;
}

export interface FeaturedPhoto extends ImageSummary {
  id: string;
  uploader: UserSummary;
}

export interface GetFeaturedPhotoQueryData {
  getFeaturedPhoto?: FeaturedPhoto | null;
}

export const GET_FEATURED_ITEMS = gql`
  query GetFeaturedItems {
    featuredPreset: listPresets(where: { featured: true }, limit: 100) {
      presets {
        id
        title
        slug
        description
        notes
        afterImage {
          url
        }
        beforeImage {
          url
        }
        tags {
          id
          displayName
        }
        creator {
          id
          username
          avatar
        }
      }
    }
    featuredFilmSim: listFilmSims(where: { featured: true }, limit: 100) {
      filmSims {
        id
        name
        slug
        description
        notes
        sampleImages {
          url
        }
        tags {
          id
          displayName
        }
        creator {
          id
          username
          avatar
        }
      }
    }
    featuredUserLists {
      id
      name
      description
      isFeatured
      owner {
        id
        username
        avatar
      }
      presets {
        id
        title
        slug
        afterImage {
          url
        }
      }
      filmSims {
        id
        name
        slug
        sampleImages {
          url
        }
      }
    }
  }
`;

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

export const MAKE_FEATURED_PHOTO = gql`
  mutation MakeFeaturedPhoto($imageId: ID!) {
    makeFeaturedPhoto(imageId: $imageId) {
      id
      url
      isFeaturedPhoto
    }
  }
`;

export const REMOVE_FEATURED_PHOTO = gql`
  mutation RemoveFeaturedPhoto($imageId: ID!) {
    removeFeaturedPhoto(imageId: $imageId) {
      id
      url
      isFeaturedPhoto
    }
  }
`;
