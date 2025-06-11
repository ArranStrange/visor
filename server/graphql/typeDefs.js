const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    _id: ID
    username: String
    email: String
    filmSims: [FilmSim]
  }

  type FilmSim {
    _id: ID
    name: String
    description: String
    creator: User
    createdAt: String
    updatedAt: String

    # Basic Settings
    version: String
    processVersion: String
    whiteBalance: String
    cameraProfile: String
    toneCurveName: String

    # Exposure and Tone
    exposure: Float
    contrast: Float
    highlights: Float
    shadows: Float
    whites: Float
    blacks: Float
    texture: Float
    clarity: Float
    dehaze: Float

    # Grain Settings
    grain: GrainSettings

    # Vignette
    vignette: VignetteSettings

    # Color Adjustments
    colorAdjustments: ColorAdjustments

    # Split Toning
    splitToning: SplitToningSettings

    # Tone Curve
    toneCurve: ToneCurveSettings

    # Metadata
    likes: Int
    downloads: Int
    tags: [String]
    isPublic: Boolean
  }

  type GrainSettings {
    amount: Float
    size: Float
    frequency: Float
  }

  type VignetteSettings {
    amount: Float
  }

  type ColorAdjustments {
    red: ColorChannel
    orange: OrangeChannel
    yellow: ColorChannel
    green: GreenChannel
    blue: BlueChannel
  }

  type ColorChannel {
    hue: Float
    saturation: Float
    luminance: Float
  }

  type OrangeChannel {
    saturation: Float
    luminance: Float
  }

  type GreenChannel {
    hue: Float
    saturation: Float
  }

  type BlueChannel {
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

  type ToneCurveSettings {
    rgb: [ToneCurvePoint]
    red: [ToneCurvePoint]
    green: [ToneCurvePoint]
    blue: [ToneCurvePoint]
  }

  type ToneCurvePoint {
    x: Float
    y: Float
  }

  type Auth {
    token: ID!
    user: User
  }

  type Query {
    me: User
    filmSims(name: String): [FilmSim]
    filmSim(filmSimId: ID!): FilmSim
    userFilmSims(userId: ID!): [FilmSim]
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
    addFilmSim(
      name: String!
      description: String!
      settings: FilmSimSettingsInput!
    ): FilmSim
    updateFilmSim(
      filmSimId: ID!
      name: String!
      description: String!
      settings: FilmSimSettingsInput!
    ): FilmSim
    removeFilmSim(filmSimId: ID!): FilmSim
    likeFilmSim(filmSimId: ID!): FilmSim
    downloadFilmSim(filmSimId: ID!): FilmSim
  }

  input FilmSimSettingsInput {
    # Basic Settings
    version: String
    processVersion: String
    whiteBalance: String
    cameraProfile: String
    toneCurveName: String

    # Exposure and Tone
    exposure: Float
    contrast: Float
    highlights: Float
    shadows: Float
    whites: Float
    blacks: Float
    texture: Float
    clarity: Float
    dehaze: Float

    # Grain Settings
    grain: GrainSettingsInput

    # Vignette
    vignette: VignetteSettingsInput

    # Color Adjustments
    colorAdjustments: ColorAdjustmentsInput

    # Split Toning
    splitToning: SplitToningSettingsInput

    # Tone Curve
    toneCurve: ToneCurveSettingsInput
  }

  input GrainSettingsInput {
    amount: Float
    size: Float
    frequency: Float
  }

  input VignetteSettingsInput {
    amount: Float
  }

  input ColorAdjustmentsInput {
    red: ColorChannelInput
    orange: OrangeChannelInput
    yellow: ColorChannelInput
    green: GreenChannelInput
    blue: BlueChannelInput
  }

  input ColorChannelInput {
    hue: Float
    saturation: Float
    luminance: Float
  }

  input OrangeChannelInput {
    saturation: Float
    luminance: Float
  }

  input GreenChannelInput {
    hue: Float
    saturation: Float
  }

  input BlueChannelInput {
    hue: Float
    saturation: Float
  }

  input SplitToningSettingsInput {
    shadowHue: Float
    shadowSaturation: Float
    highlightHue: Float
    highlightSaturation: Float
    balance: Float
  }

  input ToneCurveSettingsInput {
    rgb: [ToneCurvePointInput]
    red: [ToneCurvePointInput]
    green: [ToneCurvePointInput]
    blue: [ToneCurvePointInput]
  }

  input ToneCurvePointInput {
    x: Float
    y: Float
  }
`;

module.exports = typeDefs;
