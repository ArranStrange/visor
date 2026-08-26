const crudMutations = require("./crudMutations");
const commentMutations = require("./commentMutations");
const likeMutations = require("./likeMutations");
const recommendationMutations = require("./recommendationMutations");

module.exports = {
  ...crudMutations,
  ...commentMutations,
  ...likeMutations,
  ...recommendationMutations,
};
