const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");

// Type definitions
const scalarsTypeDefs = require("./typeDefs/scalars");
const presetTypeDefs = require("./typeDefs/preset");
const filmSimTypeDefs = require("./typeDefs/filmSim");
const listTypeDefs = require("./typeDefs/list");
const tagTypeDefs = require("./typeDefs/tag");
const userTypeDefs = require("./typeDefs/user");
const discussionTypeDefs = require("./typeDefs/discussion");
const notificationTypeDefs = require("./typeDefs/notification");
const commentTypeDefs = require("./typeDefs/comment");
const imageTypeDefs = require("./typeDefs/image");

// Resolvers
const scalarsResolvers = require("./resolvers/scalars");
const commentResolvers = require("./resolvers/comment");
const imageResolvers = require("./resolvers/image");
const presetResolvers = require("./resolvers/preset");
const filmSimResolvers = require("./resolvers/filmSim");
const listResolvers = require("./resolvers/list");
const tagResolvers = require("./resolvers/tag");
const userResolvers = require("./resolvers/user");
const discussionResolvers = require("./resolvers/discussion");
const notificationResolvers = require("./resolvers/notification");

const typeDefs = mergeTypeDefs([
  scalarsTypeDefs,
  presetTypeDefs,
  filmSimTypeDefs,
  listTypeDefs,
  tagTypeDefs,
  userTypeDefs,
  discussionTypeDefs,
  notificationTypeDefs,
  commentTypeDefs,
  imageTypeDefs,
]);

const resolvers = mergeResolvers([
  scalarsResolvers,
  commentResolvers,
  imageResolvers,
  presetResolvers,
  filmSimResolvers,
  listResolvers,
  tagResolvers,
  userResolvers,
  discussionResolvers,
  notificationResolvers,
]);

module.exports = { typeDefs, resolvers };
