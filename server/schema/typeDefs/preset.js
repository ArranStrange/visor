const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type PresetSettings {
    exposure: Float
    contrast: Float
    highlights: Float
    shadows: Float
    whites: Float
    blacks: Float
    temp: Float
    tint: Float
    vibrance: Float
    saturation: Float
    clarity: Float
    dehaze: Float
    grain: GrainSettings
    vignette: VignetteSettings
    colorAdjustments: ColorAdjustments
    splitToning: SplitToningSettings
    sharpening: Float
    noiseReduction: NoiseReductionSettings
  }

  type GrainSettings {
    amount: Float
    size: Float
    frequency: Float
  }

  type NoiseReductionSettings {
    luminance: Float
    detail: Float
    color: Float
  }

  type Preset {
    id: ID!
    title: String!
    slug: String!
    description: String
    xmpUrl: String
    settings: PresetSettings
    toneCurve: ToneCurve
    notes: String
    tags: [Tag]
    thumbnail: String
    creator: User
    filmSim: FilmSim
    likes: [User]
    downloads: Int
    isPublished: Boolean
    comments: [Comment]
    createdAt: String
    updatedAt: String
    beforeImage: Image
    afterImage: Image
    sampleImages: [Image!]
  }

  input CurvePointInput {
    x: Float!
    y: Float!
  }

  input ToneCurveInput {
    rgb: [CurvePointInput!]
    red: [CurvePointInput!]
    green: [CurvePointInput!]
    blue: [CurvePointInput!]
  }

  input PresetSettingsInput {
    exposure: Float
    contrast: Float
    highlights: Float
    shadows: Float
    whites: Float
    blacks: Float
    temp: Float
    tint: Float
    vibrance: Float
    saturation: Float
    clarity: Float
    dehaze: Float
    grain: GrainSettingsInput
    vignette: VignetteSettingsInput
    colorAdjustments: ColorAdjustmentsInput
    splitToning: SplitToningSettingsInput
    sharpening: Float
    noiseReduction: NoiseReductionSettingsInput
  }

  input GrainSettingsInput {
    amount: Float
    size: Float
    roughness: Float
  }

  input NoiseReductionSettingsInput {
    luminance: Float
    detail: Float
    color: Float
  }

  input CreatePresetInput {
    title: String!
    slug: String!
    description: String
    xmpUrl: String
    settings: PresetSettingsInput
    toneCurve: ToneCurveInput
    notes: String
    tagIds: [ID!]
    filmSimId: ID
    sampleImageIds: [ID!]
  }

  input UpdatePresetInput {
    title: String
    description: String
    settings: PresetSettingsInput
    toneCurve: ToneCurveInput
    notes: String
    tagIds: [ID!]
    filmSimId: ID
    sampleImageIds: [ID!]
  }

  input UploadPresetInput {
    title: String!
    description: String
    tags: [String!]!
    settings: PresetSettingsInput!
    toneCurve: ToneCurveInput
    notes: String
    beforeImage: Upload
    afterImage: Upload
  }

  extend type Query {
    getPreset(slug: String!): Preset
    getPresetById(id: ID!): Preset
    listPresets(filter: JSON): [Preset]
  }

  extend type Mutation {
    uploadPreset(
      title: String!
      description: String
      settings: PresetSettingsInput!
      toneCurve: ToneCurveInput
      notes: String
      tags: [String!]!
      beforeImage: ImageInput
      afterImage: ImageInput
      sampleImages: [ImageInput!]
    ): Preset!
    createPreset(input: CreatePresetInput!): Preset
    updatePreset(id: ID!, input: UpdatePresetInput!): Preset
    deletePreset(id: ID!): Boolean
    likePreset(presetId: ID!): Boolean
    downloadPreset(presetId: ID!): Boolean
  }
`;

module.exports = typeDefs;
