const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type FilmSimSettings {
    dynamicRange: Int
    # Float: Fuji bodies from the X-T4 generation take half-step tone values.
    highlight: Float
    shadow: Float
    colour: Int
    sharpness: Int
    noiseReduction: Int
    grainEffect: String
    clarity: Int
    whiteBalance: String
    wbShift: WhiteBalanceShift
    filmSimulation: String
    colorChromeEffect: String
    colorChromeFxBlue: String
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
    tags: [Tag]
    sampleImages: [Image]
    thumbnail: String
    creator: User
    recommendedPresets: [Preset]
    compatibleSensors: [String]
    compatibleCameras: [String] @deprecated(reason: "Use compatibleSensors")
    notes: String
    comments: [Comment]
    likes: [User]
    featured: Boolean
    createdAt: String
    updatedAt: String
  }

  input FilmSimSettingsInput {
    dynamicRange: Int
    filmSimulation: String!
    whiteBalance: String!
    wbShift: WhiteBalanceShiftInput!
    color: Int!
    sharpness: Int!
    highlight: Float!
    shadow: Float!
    noiseReduction: Int!
    grainEffect: String!
    clarity: Int!
    colorChromeEffect: String!
    colorChromeFxBlue: String!
  }

  input WhiteBalanceShiftInput {
    r: Int!
    b: Int!
  }

  input CreateFilmSimInput {
    name: String!
    slug: String!
    description: String
    type: String
    settings: FilmSimSettingsInput
    tagIds: [ID!]
    sampleImageIds: [ID!]
    notes: String
    recommendedPresetIds: [ID!]
    compatibleSensors: [String!]
    compatibleCameras: [String!]
  }

  type PaginatedFilmSims {
    filmSims: [FilmSim!]!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    currentPage: Int!
    totalPages: Int!
  }

  """
  Typed replacement for the untyped listFilmSims \`filter\` blob. Every field
  here is allow-listed by server/utils/contentFilters.js before it reaches
  Mongo.
  """
  input FilmSimFilterInput {
    tagId: ID
    featured: Boolean
    """Restrict to these film sims, e.g. the members of a user list."""
    ids: [ID!]
    """
    Sensor generation slug, e.g. "x-trans-iv". Matches compatibleSensors and
    falls back to the deprecated compatibleCameras field so film sims that
    predate the rename still match.
    """
    sensorKey: String
    """A camera body name; resolved to its sensor generation server-side."""
    cameraName: String
    """
    Exact name match. Temporary, same deprecation window as
    PresetFilterInput.title.
    """
    name: String
  }

  extend type Query {
    getFilmSim(slug: String!): FilmSim
    """
    \`filter\` is deprecated in favour of \`where\` and is accepted for one
    release only, per docs/plans/c1-c3-delivery-plan.md. Both arguments are
    validated by the same allow-listing builder; \`where\` wins on conflict.
    """
    listFilmSims(
      filter: JSON
      where: FilmSimFilterInput
      page: Int
      limit: Int
    ): PaginatedFilmSims!
  }

  extend type Mutation {
    uploadFilmSim(
      name: String!
      description: String
      settings: FilmSimSettingsInput!
      notes: String
      tags: [String!]!
      sampleImages: [SampleImageInput!]
      compatibleSensors: [String!]
    ): FilmSim!

    createFilmSim(input: CreateFilmSimInput!): FilmSim
    updateFilmSim(id: ID!, input: JSON!): FilmSim
    deleteFilmSim(id: ID!): Boolean
    likeFilmSim(filmSimId: ID!): Boolean

    addComment(filmSimId: ID!, text: String!): Comment!
    updateComment(filmSimId: ID!, commentId: ID!, text: String!): Comment!
    deleteComment(filmSimId: ID!, commentId: ID!): Boolean!

    addRecommendedPreset(filmSimId: ID!, presetId: ID!): FilmSim
    removeRecommendedPreset(filmSimId: ID!, presetId: ID!): FilmSim
    makeFilmSimFeatured(filmSimId: ID!): FilmSim
    removeFilmSimFeatured(filmSimId: ID!): FilmSim
  }
`;

module.exports = typeDefs;
