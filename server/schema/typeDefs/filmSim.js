const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type FilmSimSettings {
    dynamicRange: Int
    highlight: Int
    shadow: Int
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
    compatibleCameras: [String]
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
    highlight: Int!
    shadow: Int!
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
    compatibleCameras: [String!]
  }

  extend type Query {
    getFilmSim(slug: String!): FilmSim
    listFilmSims(filter: JSON): [FilmSim]
  }

  extend type Mutation {
    uploadFilmSim(
      name: String!
      description: String
      settings: FilmSimSettingsInput!
      notes: String
      tags: [String!]!
      sampleImages: [SampleImageInput!]
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
