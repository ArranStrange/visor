const { gql } = require("apollo-server-express");

module.exports = gql`
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

  input CreateUserListInput {
    name: String!
    description: String
    isPublic: Boolean
  }

  input UpdateUserListInput {
    name: String
    description: String
    isPublic: Boolean
  }

  extend type Query {
    getUserLists(userId: ID!): [UserList]
    getUserList(id: ID!): UserList
  }

  extend type Mutation {
    createUserList(input: CreateUserListInput!): UserList
    updateUserList(id: ID!, input: UpdateUserListInput!): UserList!
    deleteUserList(id: ID!): Boolean
    addToUserList(listId: ID!, presetIds: [ID!], filmSimIds: [ID!]): UserList
    removeFromUserList(listId: ID!, presetId: ID, filmSimId: ID): UserList
  }
`;
