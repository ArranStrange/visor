const crudMutations = require("./crudMutations");
const commentMutations = require("./commentMutations");
const recommendationMutations = require("./recommendationMutations");

module.exports = {
  ...crudMutations,
  ...commentMutations,
  ...recommendationMutations,
};
