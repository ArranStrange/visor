import { gql } from "@apollo/client";
import type {
  FilmSimSummary,
  ImageSummary,
  PresetSummary,
  TagSummary,
  UserSummary,
} from "@/types/graphql";
import type { FilmSimSettings, SampleImageInput } from "@/features/film-sims/types/filmSim";

export interface ListFilmSimsQueryData {
  listFilmSims: {
    filmSims: Array<FilmSimSummary & Record<string, unknown>>;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    currentPage: number;
    totalPages: number;
  };
}

export interface ListFilmSimsQueryVariables {
  page?: number;
  limit?: number;
  filter?: Record<string, unknown>;
}

export type FilmSimResponseSettings = Partial<FilmSimSettings>;

export interface FilmSimDetailResult extends FilmSimSummary {
  type?: string;
  compatibleSensors?: string[];
  notes?: string;
  settings?: FilmSimResponseSettings;
  tags?: Array<TagSummary & { id: string }>;
  sampleImages?: Array<ImageSummary & { id: string }>;
  comments?: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: UserSummary;
  }>;
  recommendedPresets?: PresetSummary[];
}

export interface GetFilmSimQueryData {
  getFilmSim: FilmSimDetailResult | null;
}

export interface GetFilmSimQueryVariables {
  slug: string;
}

export interface UpdateFilmSimInput {
  name?: string;
  description?: string;
  notes?: string;
  compatibleSensors?: string[];
  settings?: Partial<FilmSimSettings>;
}

export interface UpdateFilmSimResult extends Pick<
  FilmSimSummary,
  "id" | "name" | "slug"
> {
  description?: string;
  type?: string;
  settings?: FilmSimResponseSettings;
  compatibleSensors?: string[];
  notes?: string;
  updatedAt?: string;
}

export interface UpdateFilmSimMutationData {
  updateFilmSim: UpdateFilmSimResult | null;
}

export interface UpdateFilmSimMutationVariables {
  id: string;
  input: UpdateFilmSimInput;
}

export interface UploadFilmSimMutationData {
  uploadFilmSim: Pick<FilmSimSummary, "id" | "name" | "slug"> | null;
}

export interface UploadFilmSimMutationVariables {
  name: string;
  description?: string;
  settings: FilmSimSettings;
  notes?: string;
  tags: string[];
  sampleImages?: SampleImageInput[];
  compatibleSensors?: string[];
}

export const GET_ALL_FILMSIMS = gql`
  query ListFilmSims($page: Int, $limit: Int, $filter: JSON) {
    listFilmSims(page: $page, limit: $limit, filter: $filter) {
      filmSims {
        id
        name
        slug
        tags {
          id
          displayName
        }
        creator {
          id
          username
          avatar
        }
        sampleImages {
          url
        }
        featured
      }
      totalCount
      hasNextPage
      hasPreviousPage
      currentPage
      totalPages
    }
  }
`;

export const GET_FILMSIM_BY_SLUG = gql`
  query GetFilmSim($slug: String!) {
    getFilmSim(slug: $slug) {
      id
      name
      slug
      description
      type
      compatibleSensors
      notes
      creator {
        id
        username
        avatar
        instagram
      }
      settings {
        dynamicRange
        highlight
        shadow
        color: colour
        sharpness
        noiseReduction
        grainEffect
        clarity
        whiteBalance
        wbShift {
          r
          b
        }
        filmSimulation
      }
      tags {
        id
        name
        displayName
      }
      sampleImages {
        id
        url
        caption
        isFeaturedPhoto
      }
      featured
      comments {
        id
        content
        createdAt
        author {
          id
          username
          avatar
        }
      }
      recommendedPresets {
        id
        title
        slug
        description
        afterImage {
          url
        }
        creator {
          id
          username
          avatar
        }
        tags {
          id
          displayName
        }
      }
    }
  }
`;

export const DELETE_FILMSIM = gql`
  mutation DeleteFilmSim($id: ID!) {
    deleteFilmSim(id: $id)
  }
`;

export const UPDATE_FILMSIM = gql`
  mutation UpdateFilmSim($id: ID!, $input: JSON!) {
    updateFilmSim(id: $id, input: $input) {
      id
      name
      slug
      description
      type
      settings {
        dynamicRange
        highlight
        shadow
        color: colour
        sharpness
        noiseReduction
        grainEffect
        clarity
        whiteBalance
        wbShift {
          r
          b
        }
        filmSimulation
        colorChromeEffect
        colorChromeFxBlue
      }
      compatibleSensors
      notes
      updatedAt
    }
  }
`;

export const UPLOAD_FILM_SIM = gql`
  mutation UploadFilmSim(
    $name: String!
    $description: String
    $settings: FilmSimSettingsInput!
    $notes: String
    $tags: [String!]!
    $sampleImages: [SampleImageInput!]
    $compatibleSensors: [String!]
  ) {
    uploadFilmSim(
      name: $name
      description: $description
      settings: $settings
      notes: $notes
      tags: $tags
      sampleImages: $sampleImages
      compatibleSensors: $compatibleSensors
    ) {
      id
      name
      slug
    }
  }
`;

export const MAKE_FILMSIM_FEATURED = gql`
  mutation MakeFilmSimFeatured($filmSimId: ID!) {
    makeFilmSimFeatured(filmSimId: $filmSimId) {
      id
      name
      featured
    }
  }
`;

export const REMOVE_FILMSIM_FEATURED = gql`
  mutation RemoveFilmSimFeatured($filmSimId: ID!) {
    removeFilmSimFeatured(filmSimId: $filmSimId) {
      id
      name
      featured
    }
  }
`;

export const ADD_RECOMMENDED_PRESET = gql`
  mutation AddRecommendedPreset($filmSimId: ID!, $presetId: ID!) {
    addRecommendedPreset(filmSimId: $filmSimId, presetId: $presetId) {
      id
      name
      slug
      description
      recommendedPresets {
        id
        title
        slug
        description
        afterImage {
          url
        }
        creator {
          id
          username
          avatar
        }
        tags {
          id
          displayName
        }
      }
    }
  }
`;

export const REMOVE_RECOMMENDED_PRESET = gql`
  mutation RemoveRecommendedPreset($filmSimId: ID!, $presetId: ID!) {
    removeRecommendedPreset(filmSimId: $filmSimId, presetId: $presetId) {
      id
      name
      slug
      description
      recommendedPresets {
        id
        title
        slug
        description
        afterImage {
          url
        }
        creator {
          id
          username
          avatar
        }
        tags {
          id
          displayName
        }
      }
    }
  }
`;
