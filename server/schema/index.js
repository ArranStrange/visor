const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");

// Type definitions
const scalarsTypeDefs = require("./typeDefs/scalars");
const presetTypeDefs = require("./typeDefs/preset");
const filmSimTypeDefs = require("./typeDefs/filmSim");
const listTypeDefs = require("./typeDefs/list");
const loadoutTypeDefs = require("./typeDefs/loadout");
const tagTypeDefs = require("./typeDefs/tag");
const userTypeDefs = require("./typeDefs/user");
const discussionTypeDefs = require("./typeDefs/discussion");
const notificationTypeDefs = require("./typeDefs/notification");
const commentTypeDefs = require("./typeDefs/comment");
const imageTypeDefs = require("./typeDefs/image");
const reportTypeDefs = require("./typeDefs/report");

// Resolvers
const scalarsResolvers = require("./resolvers/scalars");
const commentResolvers = require("./resolvers/comment");
const imageResolvers = require("./resolvers/image");
const presetResolvers = require("./resolvers/preset");
const filmSimResolvers = require("./resolvers/filmSim");
const listResolvers = require("./resolvers/list");
const loadoutResolvers = require("./resolvers/loadout");
const tagResolvers = require("./resolvers/tag");
const userResolvers = require("./resolvers/user");
const discussionResolvers = require("./resolvers/discussion");
const notificationResolvers = require("./resolvers/notification");
const reportResolvers = require("./resolvers/report");

const typeDefs = mergeTypeDefs([
  scalarsTypeDefs,
  presetTypeDefs,
  filmSimTypeDefs,
  listTypeDefs,
  loadoutTypeDefs,
  tagTypeDefs,
  userTypeDefs,
  discussionTypeDefs,
  notificationTypeDefs,
  commentTypeDefs,
  imageTypeDefs,
  reportTypeDefs,
]);

const resolvers = mergeResolvers([
  scalarsResolvers,
  commentResolvers,
  imageResolvers,
  presetResolvers,
  filmSimResolvers,
  listResolvers,
  loadoutResolvers,
  tagResolvers,
  userResolvers,
  discussionResolvers,
  notificationResolvers,
  reportResolvers,
]);

module.exports = { typeDefs, resolvers };
