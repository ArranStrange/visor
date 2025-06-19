const { gql } = require("apollo-server-express");

module.exports = gql`
  scalar Upload
  scalar JSON

  type AuthPayload {
    token: String!
    user: User!
  }

  type User {
    id: ID!
    username: String!
    avatar: String
    bio: String
    email: String!
    instagram: String
    cameras: [String]
  }

  type PresetSettings {
    # Light settings
    exposure: Float
    contrast: Float
    highlights: Float
    shadows: Float
    whites: Float
    blacks: Float

    # Color settings
    temp: Float
    tint: Float
    vibrance: Float
    saturation: Float

    # Effects
    clarity: Float
    dehaze: Float
    grain: GrainSettings
    vignette: VignetteSettings
    colorAdjustments: ColorAdjustments
    splitToning: SplitToningSettings

    # Detail
    sharpening: Float
    noiseReduction: NoiseReductionSettings
  }

  type GrainSettings {
    amount: Float
    size: Float
    roughness: Float
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

  type FilmSimSettings {
    dynamicRange: Int
    highlight: Int
    shadow: Int
    colour: Int
    sharpness: Int
    noiseReduction: Int
    grainEffect: Int
    clarity: Int
    whiteBalance: String
    wbShift: WhiteBalanceShift
  }

  type WhiteBalanceShift {
    r: Int
    b: Int
  }

  type FilmSim {
    id: ID!
    name: String!
    slug: String!
    description: String
    type: String
    settings: FilmSimSettings
    toneCurve: ToneCurve
    tags: [Tag]
    sampleImages: [Image]
    thumbnail: String
    creator: User
    recommendedPresets: [Preset]
    compatibleCameras: [String]
    notes: String
    comments: [Comment]
    likes: [User]
    createdAt: String
    updatedAt: String
  }


  type Image {
    id: ID!
    url: String!
    publicId: String!
    caption: String
    associatedWith: AssociatedWith
    uploader: User
    preset: Preset
    filmSim: FilmSim
    tags: [Tag]
    isBeforeImage: Boolean
    isAfterImage: Boolean
    createdAt: String
  }

  type AssociatedWith {
    kind: String!
    item: ID!
  }

  type Comment {
    id: ID!
    author: User!
    content: String!
    preset: Preset
    filmSim: FilmSim
    parent: Comment
    reactions: CommentReactions
    createdAt: String
    updatedAt: String
  }

  type CommentReactions {
    thumbsUp: [User]
    heart: [User]
  }

  type CurvePoint {
    x: Float!
    y: Float!
  }

  type ToneCurve {
    rgb: [CurvePoint]
    red: [CurvePoint]
    green: [CurvePoint]
    blue: [CurvePoint]
  }

  input CurvePointInput {
    x: Float!
    y: Float!
  }

  input ToneCurveInput {
    rgb: [CurvePointInput]
    red: [CurvePointInput]
    green: [CurvePointInput]
    blue: [CurvePointInput]
  }

  input PresetSettingsInput {
    # Light settings
    exposure: Float
    contrast: Float
    highlights: Float
    shadows: Float
    whites: Float
    blacks: Float

    # Color settings
    temp: Float
    tint: Float
    vibrance: Float
    saturation: Float

    # Effects
    clarity: Float
    dehaze: Float
    grain: GrainSettingsInput
    vignette: VignetteSettingsInput
    colorAdjustments: ColorAdjustmentsInput
    splitToning: SplitToningSettingsInput

    # Detail
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

  input FilmSimSettingsInput {
    dynamicRange: String!
    filmSimulation: String!
    whiteBalance: String!
    wbShift: WhiteBalanceShiftInput!
    color: Int!
    sharpness: Int!
    highlight: Int!
    shadow: Int!
    noiseReduction: Int!
    grainEffect: Int!
    clarity: Int!
  }

  input WhiteBalanceShiftInput {
    r: Int!
    b: Int!
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

  input CreateFilmSimInput {
    name: String!
    slug: String!
    description: String
    type: String
    settings: FilmSimSettingsInput
    toneCurve: ToneCurveInput
    tagIds: [ID!]
    sampleImageIds: [ID!]
    notes: String
    recommendedPresetIds: [ID!]
    compatibleCameras: [String!]
  }

  input CreateCommentInput {
    content: String!
    presetId: ID
    filmSimId: ID
    parentId: ID
  }

  input ImageMetaInput {
    caption: String
    presetId: ID
    filmSimId: ID
    tagIds: [ID!]
  }

  input SampleImageInput {
    url: String!
    publicId: String!
  }

  input ImageInput {
    url: String!
    publicId: String!
    associatedWith: AssociatedWithInput
  }

  input AssociatedWithInput {
    kind: String!
    item: ID!
  }

  type Query {
    getUser(id: ID!): User
    getCurrentUser: User
    searchUsers(query: String!): [User]

    getPreset(slug: String!): Preset
    getPresetById(id: ID!): Preset
    listPresets(filter: JSON): [Preset]

    getFilmSim(slug: String!): FilmSim
    listFilmSims(filter: JSON): [FilmSim]

    getImage(id: ID!): Image
    listImagesByPreset(presetId: ID!): [Image]

    getCommentsForPreset(presetId: ID!): [Comment]
    getCommentsForFilmSim(filmSimId: ID!): [Comment]
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    register(username: String!, email: String!, password: String!): AuthPayload!
    updateProfile(input: JSON!): User
    uploadAvatar(file: Upload!): String

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

    uploadFilmSim(
      name: String!
      description: String
      settings: FilmSimSettingsInput!
      notes: String
      tags: [String!]!
      sampleImages: [SampleImageInput!]
    ): FilmSim!

    createPreset(input: CreatePresetInput!): Preset
    updatePreset(id: ID!, input: UpdatePresetInput!): Preset
    deletePreset(id: ID!): Boolean
    likePreset(presetId: ID!): Boolean
    downloadPreset(presetId: ID!): Boolean

    createFilmSim(input: CreateFilmSimInput!): FilmSim
    updateFilmSim(id: ID!, input: JSON!): FilmSim
    deleteFilmSim(id: ID!): Boolean
    likeFilmSim(filmSimId: ID!): Boolean

    uploadImage(file: Upload!, input: ImageMetaInput!): Image
    deleteImage(id: ID!): Boolean

    createComment(input: CreateCommentInput!): Comment
    reactToComment(commentId: ID!, reaction: String!): Comment
    deleteComment(id: ID!): Boolean
  }

  type VignetteSettings {
    amount: Float
  }
  input VignetteSettingsInput {
    amount: Float
  }

  type ColorAdjustments {
    red: ColorChannel
    orange: OrangeChannel
    yellow: ColorChannel
    green: GreenChannel
    blue: BlueChannel
  }
  input ColorAdjustmentsInput {
    red: ColorChannelInput
    orange: OrangeChannelInput
    yellow: ColorChannelInput
    green: GreenChannelInput
    blue: BlueChannelInput
  }

  type ColorChannel {
    hue: Float
    saturation: Float
    luminance: Float
  }
  input ColorChannelInput {
    hue: Float
    saturation: Float
    luminance: Float
  }

  type OrangeChannel {
    saturation: Float
    luminance: Float
  }
  input OrangeChannelInput {
    saturation: Float
    luminance: Float
  }

  type GreenChannel {
    hue: Float
    saturation: Float
  }
  input GreenChannelInput {
    hue: Float
    saturation: Float
  }

  type BlueChannel {
    hue: Float
    saturation: Float
  }
  input BlueChannelInput {
    hue: Float
    saturation: Float
  }

  type SplitToningSettings {
    shadowHue: Float
    shadowSaturation: Float
    highlightHue: Float
    highlightSaturation: Float
    balance: Float
  }
  input SplitToningSettingsInput {
    shadowHue: Float
    shadowSaturation: Float
    highlightHue: Float
    highlightSaturation: Float
    balance: Float
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
`;
