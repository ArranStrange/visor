import { gql } from "@apollo/client";
import type {
  ColorGradingSettings,
  ImageInput,
  PresetDetail,
  PresetDetailSettings,
  PresetSettings,
  PresetSummary,
  ToneCurve,
} from "@/types/graphql";

export interface ListPresetsQueryData {
  listPresets: {
    presets: Array<PresetSummary & Record<string, unknown>>;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    currentPage: number;
    totalPages: number;
  };
}

export interface ListPresetsQueryVariables {
  page?: number;
  limit?: number;
  filter?: Record<string, unknown>;
}

export interface GetPresetQueryData {
  getPreset: PresetDetail | null;
}

export interface GetPresetQueryVariables {
  slug: string;
}

export interface SearchPresetsQueryData {
  listPresets: {
    presets: PresetSummary[];
    totalCount: number;
    hasNextPage: boolean;
    currentPage: number;
    totalPages: number;
  };
}

export interface SearchPresetsQueryVariables {
  query: string;
  page: number;
  limit: number;
}

export interface DeletePresetMutationData {
  deletePreset: boolean;
}

export interface DeletePresetMutationVariables {
  id: string;
}

export interface UpdatePresetInput {
  title?: string;
  description?: string;
  notes?: string;
  settings?: Partial<PresetDetailSettings>;
  toneCurve?: ToneCurve;
  xmpUrl?: string | null;
}

export type UpdatePresetResult = Pick<
  PresetDetail,
  "id" | "title" | "slug" | "creator" | "tags"
> &
  Pick<
    Partial<PresetDetail>,
    | "description"
    | "notes"
    | "settings"
    | "toneCurve"
    | "xmpUrl"
    | "likes"
    | "downloads"
    | "createdAt"
  > & { updatedAt?: string };

export interface UpdatePresetMutationData {
  updatePreset: UpdatePresetResult | null;
}

export interface UpdatePresetMutationVariables {
  id: string;
  input: UpdatePresetInput;
}

export interface UploadPresetMutationData {
  uploadPreset: Pick<PresetSummary, "id" | "title" | "slug"> | null;
}

export interface UploadPresetMutationVariables {
  title: string;
  description?: string;
  settings: PresetSettings;
  toneCurve?: ToneCurve;
  colorGrading?: ColorGradingSettings;
  notes?: string;
  tags: string[];
  beforeImage?: ImageInput;
  afterImage?: ImageInput;
  sampleImages?: ImageInput[];
  xmpUrl?: string | null;
}

export const GET_ALL_PRESETS = gql`
  query ListPresets($page: Int, $limit: Int, $filter: JSON) {
    listPresets(page: $page, limit: $limit, filter: $filter) {
      presets {
        id
        title
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
        afterImage {
          url
        }
        beforeImage {
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

export const GET_PRESET_BY_SLUG = gql`
  query GetPreset($slug: String!) {
    getPreset(slug: $slug) {
      id
      title
      slug
      description
      xmpUrl
      settings {
        exposure
        contrast
        highlights
        shadows
        whites
        blacks
        clarity
        vibrance
        saturation
        temp
        tint
        dehaze
        texture
        grain {
          amount
          size
          roughness
        }
        sharpening
        sharpenRadius
        sharpenDetail
        sharpenEdgeMasking
        luminanceSmoothing
        luminanceDetail
        luminanceContrast
        noiseReduction {
          luminance
          color
          detail
          colorSmoothness
        }
        colorAdjustments {
          red {
            hue
            saturation
            luminance
          }
          orange {
            hue
            saturation
            luminance
          }
          yellow {
            hue
            saturation
            luminance
          }
          green {
            hue
            saturation
            luminance
          }
          aqua {
            hue
            saturation
            luminance
          }
          blue {
            hue
            saturation
            luminance
          }
          purple {
            hue
            saturation
            luminance
          }
          magenta {
            hue
            saturation
            luminance
          }
        }
      }
      toneCurve {
        rgb {
          x
          y
        }
        red {
          x
          y
        }
        green {
          x
          y
        }
        blue {
          x
          y
        }
      }
      notes
      creator {
        id
        username
        avatar
        instagram
      }
      tags {
        id
        name
        displayName
      }
      beforeImage {
        id
        url
        publicId
      }
      afterImage {
        id
        url
        publicId
      }
      sampleImages {
        id
        url
        caption
        isFeaturedPhoto
      }
      featured
      likes {
        id
      }
      downloads
      createdAt
    }
  }
`;

export const SEARCH_PRESETS = gql`
  query SearchPresets($query: String!, $page: Int!, $limit: Int!) {
    listPresets(filter: { title: $query }, page: $page, limit: $limit) {
      presets {
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
      totalCount
      hasNextPage
      currentPage
      totalPages
    }
  }
`;

export const DELETE_PRESET = gql`
  mutation DeletePreset($id: ID!) {
    deletePreset(id: $id)
  }
`;

export const UPDATE_PRESET = gql`
  mutation UpdatePreset($id: ID!, $input: UpdatePresetInput!) {
    updatePreset(id: $id, input: $input) {
      id
      title
      slug
      description
      notes
      settings {
        exposure
        contrast
        highlights
        shadows
        whites
        blacks
        temp
        tint
        vibrance
        saturation
        clarity
        dehaze
        grain {
          amount
          size
          roughness
        }
        vignette {
          amount
        }
        colorAdjustments {
          red {
            hue
            saturation
            luminance
          }
          orange {
            saturation
            luminance
          }
          yellow {
            hue
            saturation
            luminance
          }
          green {
            hue
            saturation
          }
          blue {
            hue
            saturation
          }
        }
        splitToning {
          shadowHue
          shadowSaturation
          highlightHue
          highlightSaturation
          balance
        }
        sharpening
        noiseReduction {
          luminance
          detail
          color
        }
      }
      toneCurve {
        rgb {
          x
          y
        }
        red {
          x
          y
        }
        green {
          x
          y
        }
        blue {
          x
          y
        }
      }
      tags {
        id
        name
        displayName
      }
      creator {
        id
        username
        avatar
        instagram
      }
      xmpUrl
      likes {
        id
      }
      downloads
      createdAt
      updatedAt
    }
  }
`;

export const UPLOAD_PRESET = gql`
  mutation UploadPreset(
    $title: String!
    $description: String
    $settings: PresetSettingsInput!
    $toneCurve: ToneCurveInput
    $colorGrading: ColorGradingInput
    $notes: String
    $tags: [String!]!
    $beforeImage: ImageInput
    $afterImage: ImageInput
    $sampleImages: [ImageInput!]
    $xmpUrl: String
  ) {
    uploadPreset(
      title: $title
      description: $description
      settings: $settings
      toneCurve: $toneCurve
      colorGrading: $colorGrading
      notes: $notes
      tags: $tags
      beforeImage: $beforeImage
      afterImage: $afterImage
      sampleImages: $sampleImages
      xmpUrl: $xmpUrl
    ) {
      id
      title
      slug
    }
  }
`;

export const ADD_PHOTO_TO_PRESET = gql`
  mutation AddPhotoToPreset(
    $presetId: ID!
    $imageUrl: String!
    $caption: String
  ) {
    addPhotoToPreset(
      presetId: $presetId
      imageUrl: $imageUrl
      caption: $caption
    ) {
      id
      url
      caption
    }
  }
`;

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
