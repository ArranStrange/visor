const { gql } = require("apollo-server-express");

module.exports = gql`
  scalar Upload
  scalar JSON

  type User {
    id: ID!
    username: String!
    avatar: String
    bio: String
    email: String!
    instagram: String
    cameras: [String]
    favouriteLists: [UserList]
    customLists: [UserList]
  }

  type Preset {
    id: ID!
    title: String!
    slug: String!
    description: String
    xmpUrl: String!
    settings: JSON
    toneCurve: ToneCurve
    notes: String
    tags: [Tag]
    sampleImages: [Image]
    creator: User!
    filmSim: FilmSim
    likes: [User]
    downloads: Int
    isPublished: Boolean
    comments: [Comment]
    createdAt: String
    updatedAt: String
  }

  type FilmSim {
    id: ID!
    name: String!
    slug: String!
    description: String
    type: String
    approximationSettings: JSON
    toneCurve: ToneCurve
    tags: [Tag]
    sampleImages: [Image]
    creator: User
    recommendedPresets: [Preset]
    compatibleCameras: [String]
    notes: String
    comments: [Comment]
    likes: [User]
    createdAt: String
    updatedAt: String
  }

  type Tag {
    id: ID!
    name: String!
    displayName: String!
    description: String
    category: String!
    relatedTags: [Tag]
    createdBy: User
  }

  type Image {
    id: ID!
    url: String!
    caption: String
    uploader: User
    preset: Preset
    filmSim: FilmSim
    tags: [Tag]
    createdAt: String
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

  type UserList {
    id: ID!
    name: String!
    description: String
    owner: User!
    presets: [Preset]
    filmSims: [FilmSim]
    isFavouriteList: Boolean
    isPublic: Boolean
    collaborators: [User]
    createdAt: String
    updatedAt: String
  }

  type ToneCurve {
    rgb: [Int]
    red: [Int]
    green: [Int]
    blue: [Int]
  }

  input ToneCurveInput {
    rgb: [Int]
    red: [Int]
    green: [Int]
    blue: [Int]
  }

  input CreatePresetInput {
    title: String!
    slug: String!
    description: String
    xmpUrl: String!
    settings: JSON
    toneCurve: ToneCurveInput
    notes: String
    tagIds: [ID!]
    filmSimId: ID
    sampleImageIds: [ID!]
  }

  input UpdatePresetInput {
    title: String
    description: String
    settings: JSON
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
    approximationSettings: JSON
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

  type Query {
    getUser(id: ID!): User
    getCurrentUser: User
    searchUsers(query: String!): [User]

    getPreset(slug: String!): Preset
    listPresets(filter: JSON): [Preset]

    getFilmSim(slug: String!): FilmSim
    listFilmSims(filter: JSON): [FilmSim]

    allTags: [String]

    getImage(id: ID!): Image
    listImagesByPreset(presetId: ID!): [Image]

    getTag(name: String!): Tag
    listTags(category: String): [Tag]

    getUserLists(userId: ID!): [UserList]
    getUserList(id: ID!): UserList

    getCommentsForPreset(presetId: ID!): [Comment]
    getCommentsForFilmSim(filmSimId: ID!): [Comment]
  }

  type Mutation {
    updateProfile(input: JSON!): User
    uploadAvatar(file: Upload!): String

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
`;
