const discussionMutations = require("./discussionMutations");
const postMutations = require("./postMutations");
const replyMutations = require("./replyMutations");
const adminMutations = require("./adminMutations");

module.exports = {
  ...discussionMutations,
  ...postMutations,
  ...replyMutations,
  ...adminMutations,
};
